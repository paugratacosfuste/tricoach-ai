import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingData, UserProfile, FitnessAssessment, RaceGoal, WeeklyAvailability, Integrations } from '@/types/training';

interface OnboardingContextType {
  data: Partial<OnboardingData>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateFitness: (fitness: Partial<FitnessAssessment>) => void;
  updateGoal: (goal: Partial<RaceGoal>) => void;
  updateAvailability: (availability: Partial<WeeklyAvailability>) => void;
  updateIntegrations: (integrations: Partial<Integrations>) => void;
  isComplete: boolean;
  isStarted: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

const defaultAvailability: WeeklyAvailability = {
  monday: { available: true, timeSlots: ['evening'], maxDuration: '60min' },
  tuesday: { available: true, timeSlots: ['evening'], maxDuration: '60min' },
  wednesday: { available: true, timeSlots: ['evening'], maxDuration: '60min' },
  thursday: { available: true, timeSlots: ['evening'], maxDuration: '60min' },
  friday: { available: false, timeSlots: [], maxDuration: '30min' },
  saturday: { available: true, timeSlots: ['morning'], maxDuration: '2h', longSession: true },
  sunday: { available: true, timeSlots: ['morning'], maxDuration: '2h30', longSession: true },
  weeklyHoursTarget: '8-10h',
};

const defaultIntegrations: Integrations = {
  googleCalendar: { connected: false, avoidConflicts: true },
  strava: { connected: false, autoComplete: true },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [isComplete, setIsComplete] = useState(() => {
    return localStorage.getItem('onboarding_complete') === 'true';
  });
  
  const [isStarted, setIsStarted] = useState(() => {
    return localStorage.getItem('onboarding_started') === 'true';
  });
  
  const [data, setData] = useState<Partial<OnboardingData>>(() => {
    const saved = localStorage.getItem('onboarding_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.goal?.raceDate) {
        parsed.goal.raceDate = new Date(parsed.goal.raceDate);
      }
      return parsed;
    }
    return {
      availability: defaultAvailability,
      integrations: defaultIntegrations,
    };
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setData(prev => {
      const updated = { ...prev, profile: { ...prev.profile, ...profile } as UserProfile };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const updateFitness = (fitness: Partial<FitnessAssessment>) => {
    setData(prev => {
      const updated = { ...prev, fitness: { ...prev.fitness, ...fitness } as FitnessAssessment };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const updateGoal = (goal: Partial<RaceGoal>) => {
    setData(prev => {
      const updated = { ...prev, goal: { ...prev.goal, ...goal } as RaceGoal };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAvailability = (availability: Partial<WeeklyAvailability>) => {
    setData(prev => {
      const updated = { ...prev, availability: { ...prev.availability, ...availability } as WeeklyAvailability };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const updateIntegrations = (integrations: Partial<Integrations>) => {
    setData(prev => {
      const updated = { ...prev, integrations: { ...prev.integrations, ...integrations } as Integrations };
      localStorage.setItem('onboarding_data', JSON.stringify(updated));
      return updated;
    });
  };

  const startOnboarding = () => {
    setIsStarted(true);
    setCurrentStep(1);
    localStorage.setItem('onboarding_started', 'true');
  };

  const completeOnboarding = () => {
    setIsComplete(true);
    setIsStarted(false);
    localStorage.setItem('onboarding_complete', 'true');
    localStorage.removeItem('onboarding_started');
  };

  const resetOnboarding = () => {
    setIsComplete(false);
    setIsStarted(false);
    setCurrentStep(1);
    setData({
      availability: defaultAvailability,
      integrations: defaultIntegrations,
    });
    localStorage.removeItem('onboarding_complete');
    localStorage.removeItem('onboarding_started');
    localStorage.removeItem('onboarding_data');
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <OnboardingContext.Provider value={{
      data,
      currentStep,
      setCurrentStep,
      updateData,
      updateProfile,
      updateFitness,
      updateGoal,
      updateAvailability,
      updateIntegrations,
      isComplete,
      isStarted,
      startOnboarding,
      completeOnboarding,
      resetOnboarding,
      nextStep,
      previousStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}