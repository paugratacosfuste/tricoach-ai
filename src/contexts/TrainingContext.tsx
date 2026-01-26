import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TrainingPlan, Workout, WorkoutStatus } from '@/types/training';
import { generateMockPlan } from '@/lib/mockPlanGenerator';

interface TrainingContextType {
  plan: TrainingPlan | null;
  loading: boolean;
  generatePlan: () => Promise<void>;
  updateWorkoutStatus: (workoutId: string, status: WorkoutStatus, actualData?: Workout['actualData']) => void;
  getWorkoutById: (id: string) => Workout | undefined;
  getWorkoutsForDate: (date: Date) => Workout[];
  getTodayWorkout: () => Workout | undefined;
  getWeekWorkouts: (weekStart: Date) => Workout[];
  completedCount: number;
  totalCount: number;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<TrainingPlan | null>(() => {
    const saved = localStorage.getItem('training_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Restore dates
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.weeks.forEach((week: any) => {
        week.workouts.forEach((workout: any) => {
          workout.date = new Date(workout.date);
        });
      });
      return parsed;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newPlan = generateMockPlan();
    setPlan(newPlan);
    localStorage.setItem('training_plan', JSON.stringify(newPlan));
    setLoading(false);
  };

  const updateWorkoutStatus = (workoutId: string, status: WorkoutStatus, actualData?: Workout['actualData']) => {
    if (!plan) return;
    
    const updatedPlan = {
      ...plan,
      weeks: plan.weeks.map(week => ({
        ...week,
        workouts: week.workouts.map(workout => 
          workout.id === workoutId 
            ? { ...workout, status, actualData }
            : workout
        ),
      })),
    };
    setPlan(updatedPlan);
    localStorage.setItem('training_plan', JSON.stringify(updatedPlan));
  };

  const getWorkoutById = (id: string): Workout | undefined => {
    if (!plan) return undefined;
    for (const week of plan.weeks) {
      const workout = week.workouts.find(w => w.id === id);
      if (workout) return workout;
    }
    return undefined;
  };

  const getWorkoutsForDate = (date: Date): Workout[] => {
    if (!plan) return [];
    const dateStr = date.toDateString();
    const workouts: Workout[] = [];
    plan.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        if (new Date(workout.date).toDateString() === dateStr) {
          workouts.push(workout);
        }
      });
    });
    return workouts;
  };

  const getTodayWorkout = (): Workout | undefined => {
    const today = new Date();
    const workouts = getWorkoutsForDate(today);
    return workouts.find(w => w.type !== 'rest');
  };

  const getWeekWorkouts = (weekStart: Date): Workout[] => {
    if (!plan) return [];
    const workouts: Workout[] = [];
    const startTime = weekStart.getTime();
    const endTime = startTime + 7 * 24 * 60 * 60 * 1000;
    
    plan.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        const workoutTime = new Date(workout.date).getTime();
        if (workoutTime >= startTime && workoutTime < endTime) {
          workouts.push(workout);
        }
      });
    });
    return workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const allWorkouts = plan?.weeks.flatMap(w => w.workouts.filter(wo => wo.type !== 'rest')) || [];
  const completedCount = allWorkouts.filter(w => w.status === 'completed').length;
  const totalCount = allWorkouts.length;

  return (
    <TrainingContext.Provider value={{
      plan,
      loading,
      generatePlan,
      updateWorkoutStatus,
      getWorkoutById,
      getWorkoutsForDate,
      getTodayWorkout,
      getWeekWorkouts,
      completedCount,
      totalCount,
    }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within TrainingProvider');
  }
  return context;
}
