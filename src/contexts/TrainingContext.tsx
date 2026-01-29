// src/contexts/TrainingContext.tsx
//
// PURPOSE: Manages all training plan state.
// Handles week generation, workout completion, and history tracking.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TrainingPlan,
  WeekPlan,
  Workout,
  CompletedWeek,
  WeekFeedback,
  OnboardingData,
  WorkoutStatus,
} from '@/types/training';
import { generateWeekPlan, createWeekSummary } from '@/lib/claudeApi';

// ============================================
// CONTEXT TYPES
// ============================================

interface TrainingContextType {
  // State
  plan: TrainingPlan | null;
  currentWeek: WeekPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Plan management
  initializePlan: (userData: OnboardingData) => Promise<void>;
  generateNextWeek: (feedback: WeekFeedback, constraints?: string) => Promise<void>;
  
  // Workout management
  updateWorkoutStatus: (workoutId: string, status: WorkoutStatus, actualData?: Workout['actualData']) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;
  getTodaysWorkout: () => Workout | undefined;
  getUpcomingWorkouts: (count: number) => Workout[];
  getWorkoutsForDate: (date: Date) => Workout[];
  
  // Week management
  completeCurrentWeek: (feedback: WeekFeedback) => void;
  
  // Utilities
  clearError: () => void;
  resetPlan: () => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  PLAN: 'tricoach-training-plan',
  USER_DATA: 'tricoach-user-data',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateTotalWeeks(raceDate: Date): number {
  const now = new Date();
  const diffTime = new Date(raceDate).getTime() - now.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, Math.min(52, diffWeeks)); // Cap at 52 weeks
}

function savePlanToStorage(plan: TrainingPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save plan to localStorage:', error);
  }
}

function loadPlanFromStorage(): TrainingPlan | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (!stored) return null;
    
    const plan = JSON.parse(stored);
    
    // Rehydrate dates
    plan.createdAt = new Date(plan.createdAt);
    plan.raceDate = new Date(plan.raceDate);
    
    if (plan.currentWeek) {
      plan.currentWeek.startDate = new Date(plan.currentWeek.startDate);
      plan.currentWeek.endDate = new Date(plan.currentWeek.endDate);
      plan.currentWeek.workouts = plan.currentWeek.workouts.map((w: any) => ({
        ...w,
        date: new Date(w.date),
      }));
    }
    
    plan.completedWeeks = plan.completedWeeks.map((week: any) => ({
      ...week,
      startDate: new Date(week.startDate),
      endDate: new Date(week.endDate),
      workouts: week.workouts.map((w: any) => ({
        ...w,
        date: new Date(w.date),
      })),
    }));
    
    return plan;
  } catch (error) {
    console.error('Failed to load plan from localStorage:', error);
    return null;
  }
}

function saveUserDataToStorage(userData: OnboardingData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
}

function loadUserDataFromStorage(): OnboardingData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    // Rehydrate race date
    if (data.goal?.raceDate) {
      data.goal.raceDate = new Date(data.goal.raceDate);
    }
    return data;
  } catch (error) {
    console.error('Failed to load user data from localStorage:', error);
    return null;
  }
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedPlan = loadPlanFromStorage();
    const storedUserData = loadUserDataFromStorage();
    
    if (storedPlan) {
      setPlan(storedPlan);
      console.log('Loaded plan from storage:', storedPlan);
    }
    
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  // Save plan whenever it changes
  useEffect(() => {
    if (plan) {
      savePlanToStorage(plan);
    }
  }, [plan]);

  /**
   * Initialize a new training plan and generate the first week
   */
  const initializePlan = async (newUserData: OnboardingData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save user data
      setUserData(newUserData);
      saveUserDataToStorage(newUserData);
      
      // Calculate total weeks until race
      const totalWeeks = calculateTotalWeeks(new Date(newUserData.goal.raceDate));
      
      console.log(`Initializing ${totalWeeks}-week plan for ${newUserData.goal.raceName}`);
      
      // Generate first week
      const firstWeek = await generateWeekPlan(
        newUserData,
        1,
        totalWeeks,
        [] // No history yet
      );
      
      // Create the plan
      const newPlan: TrainingPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date(),
        raceName: newUserData.goal.raceName,
        raceDate: new Date(newUserData.goal.raceDate),
        raceType: newUserData.goal.raceType,
        totalWeeks,
        currentWeekNumber: 1,
        currentWeek: firstWeek,
        completedWeeks: [],
      };
      
      setPlan(newPlan);
      console.log('Plan initialized successfully!');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize plan';
      console.error('Error initializing plan:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete the current week and generate the next one
   */
  const generateNextWeek = async (feedback: WeekFeedback, constraints?: string): Promise<void> => {
    if (!plan || !plan.currentWeek || !userData) {
      setError('No active plan or user data found');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create completed week record
      const completedWeek: CompletedWeek = {
        weekNumber: plan.currentWeek.weekNumber,
        startDate: plan.currentWeek.startDate,
        endDate: plan.currentWeek.endDate,
        phase: plan.currentWeek.phase,
        theme: plan.currentWeek.theme,
        focus: plan.currentWeek.focus,
        workouts: plan.currentWeek.workouts,
        summary: createWeekSummary(plan.currentWeek, feedback),
      };
      
      const newCompletedWeeks = [...plan.completedWeeks, completedWeek];
      const nextWeekNumber = plan.currentWeekNumber + 1;
      
      // Check if we've reached the race
      if (nextWeekNumber > plan.totalWeeks) {
        // Plan complete!
        setPlan({
          ...plan,
          currentWeekNumber: nextWeekNumber,
          currentWeek: null,
          completedWeeks: newCompletedWeeks,
        });
        console.log('Training plan completed! Race week reached.');
        return;
      }
      
      // Generate next week
      console.log(`Generating week ${nextWeekNumber} of ${plan.totalWeeks}...`);
      
      const nextWeek = await generateWeekPlan(
        userData,
        nextWeekNumber,
        plan.totalWeeks,
        newCompletedWeeks,
        constraints
      );
      
      // Update plan
      setPlan({
        ...plan,
        currentWeekNumber: nextWeekNumber,
        currentWeek: nextWeek,
        completedWeeks: newCompletedWeeks,
      });
      
      console.log(`Week ${nextWeekNumber} generated successfully!`);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate next week';
      console.error('Error generating next week:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete current week without generating next (for manual review)
   */
  const completeCurrentWeek = (feedback: WeekFeedback): void => {
    if (!plan || !plan.currentWeek) return;
    
    const completedWeek: CompletedWeek = {
      weekNumber: plan.currentWeek.weekNumber,
      startDate: plan.currentWeek.startDate,
      endDate: plan.currentWeek.endDate,
      phase: plan.currentWeek.phase,
      theme: plan.currentWeek.theme,
      focus: plan.currentWeek.focus,
      workouts: plan.currentWeek.workouts,
      summary: createWeekSummary(plan.currentWeek, feedback),
    };
    
    setPlan({
      ...plan,
      completedWeeks: [...plan.completedWeeks, completedWeek],
    });
  };

  /**
   * Update a workout's status and optional actual data
   */
  const updateWorkoutStatus = (
    workoutId: string,
    status: WorkoutStatus,
    actualData?: Workout['actualData']
  ): void => {
    if (!plan || !plan.currentWeek) return;
    
    const updatedWorkouts = plan.currentWeek.workouts.map((workout) => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          status,
          actualData: actualData || workout.actualData,
        };
      }
      return workout;
    });
    
    setPlan({
      ...plan,
      currentWeek: {
        ...plan.currentWeek,
        workouts: updatedWorkouts,
      },
    });
  };

  /**
   * Get a specific workout by ID
   */
  const getWorkoutById = (workoutId: string): Workout | undefined => {
    if (!plan?.currentWeek) return undefined;
    return plan.currentWeek.workouts.find((w) => w.id === workoutId);
  };

  /**
   * Get today's workout (if any)
   */
  const getTodaysWorkout = (): Workout | undefined => {
    if (!plan?.currentWeek) return undefined;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return plan.currentWeek.workouts.find((w) => {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    });
  };

  /**
   * Get upcoming workouts (from today forward)
   */
  const getUpcomingWorkouts = (count: number): Workout[] => {
    if (!plan?.currentWeek) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return plan.currentWeek.workouts
      .filter((w) => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() >= today.getTime() && w.type !== 'rest';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, count);
  };

  /**
   * Get workouts for a specific date
   */
  const getWorkoutsForDate = (date: Date): Workout[] => {
    if (!plan?.currentWeek) return [];
    
    return plan.currentWeek.workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getDate() === date.getDate() &&
        workoutDate.getMonth() === date.getMonth() &&
        workoutDate.getFullYear() === date.getFullYear()
      );
    });
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Reset everything
   */
  const resetPlan = (): void => {
    setPlan(null);
    setUserData(null);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  return (
    <TrainingContext.Provider
      value={{
        plan,
        currentWeek: plan?.currentWeek || null,
        isLoading,
        error,
        initializePlan,
        generateNextWeek,
        updateWorkoutStatus,
        getWorkoutById,
        getTodaysWorkout,
        getUpcomingWorkouts,
        getWorkoutsForDate,
        completeCurrentWeek,
        clearError,
        resetPlan,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useTraining(): TrainingContextType {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}