export type RaceType = 
  | 'marathon'
  | 'half-marathon'
  | 'olympic-triathlon'
  | 'sprint-triathlon'
  | '70.3-ironman'
  | 'full-ironman'
  | 'custom';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type SwimLevel = 'cant-swim' | 'learning' | 'comfortable' | 'competitive';
export type GoalPriority = 'finish' | 'pb' | 'podium';
export type WorkoutType = 'swim' | 'bike' | 'run' | 'strength' | 'rest';
export type WorkoutStatus = 'planned' | 'completed' | 'skipped' | 'partial';
export type TimeSlot = 'morning' | 'midday' | 'evening';
export type Duration = '30min' | '45min' | '60min' | '90min' | '2h' | '2h30' | '3h+';

export interface UserProfile {
  firstName: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight: number;
  height: number;
}

export interface FitnessAssessment {
  fitnessLevel: FitnessLevel;
  lthr: number;
  thresholdPace: string;
  maxHR: number;
  ftp?: number;
  swimLevel: SwimLevel;
}

export interface RaceGoal {
  raceType: RaceType;
  raceName: string;
  raceDate: Date;
  goalTime?: string;
  priority: GoalPriority;
  customDistances?: {
    swim?: number;
    bike?: number;
    run: number;
  };
}

export interface DayAvailability {
  available: boolean;
  timeSlots: TimeSlot[];
  maxDuration: Duration;
  longSession?: boolean;
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
  weeklyHoursTarget: string;
}

export interface Integrations {
  googleCalendar: {
    connected: boolean;
    readCalendar?: string;
    writeCalendar?: string;
    avoidConflicts: boolean;
  };
  strava: {
    connected: boolean;
    autoComplete: boolean;
  };
}

export interface OnboardingData {
  profile: UserProfile;
  fitness: FitnessAssessment;
  goal: RaceGoal;
  availability: WeeklyAvailability;
  integrations: Integrations;
}

export interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  description: string;
}

export interface WorkoutSegment {
  name: string;
  duration: string;
  description: string;
  targetHR?: { min: number; max: number };
  targetPace?: string;
  targetPower?: { min: number; max: number };
}

export interface Workout {
  id: string;
  date: Date;
  type: WorkoutType;
  name: string;
  duration: number; // minutes
  distance?: number; // km
  description: string;
  purpose: string;
  structure: WorkoutSegment[];
  heartRateGuidance: string;
  paceGuidance: string;
  coachingTips: string[];
  adaptationNotes: string;
  status: WorkoutStatus;
  actualData?: {
    duration: number;
    distance?: number;
    avgHR?: number;
    feeling: 1 | 2 | 3 | 4 | 5;
    notes?: string;
  };
}

export interface WeekPlan {
  weekNumber: number;
  theme: string;
  focus: string;
  totalHours: number;
  workouts: Workout[];
}

export interface TrainingPlan {
  id: string;
  createdAt: Date;
  weeks: WeekPlan[];
  phase: string;
  notes: string;
}
