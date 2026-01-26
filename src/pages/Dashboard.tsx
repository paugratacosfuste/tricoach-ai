import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WorkoutCard } from '@/components/dashboard/WorkoutCard';
import { WorkoutDetailSheet } from '@/components/dashboard/WorkoutDetailSheet';
import { WeeklyStrip } from '@/components/dashboard/WeeklyStrip';
import { useTraining } from '@/contexts/TrainingContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Workout } from '@/types/training';
import { format, startOfWeek, isSameDay } from 'date-fns';
import { TrendingUp, Clock, MapPin, RefreshCw, Loader2 } from 'lucide-react';

export function Dashboard() {
  const { data } = useOnboarding();
  const { 
    plan, 
    loading,
    generatePlan,
    getTodayWorkout, 
    getWorkoutsForDate,
    getWeekWorkouts,
    updateWorkoutStatus,
    completedCount,
    totalCount 
  } = useTraining();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const todayWorkout = getTodayWorkout();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekWorkouts = getWeekWorkouts(weekStart);
  const selectedDateWorkouts = getWorkoutsForDate(selectedDate);
  
  const weekCompleted = weekWorkouts.filter(w => w.status === 'completed' && w.type !== 'rest').length;
  const weekTotal = weekWorkouts.filter(w => w.type !== 'rest').length;
  const weekProgress = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

  const totalWeekHours = weekWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60;
  const totalWeekDistance = weekWorkouts
    .filter(w => w.type === 'run')
    .reduce((sum, w) => sum + (w.distance || 0), 0);

  const handleComplete = (workout: Workout) => {
    updateWorkoutStatus(workout.id, 'completed', {
      duration: workout.duration,
      distance: workout.distance,
      feeling: 3,
    });
    setSheetOpen(false);
  };

  const handleSkip = (workout: Workout) => {
    updateWorkoutStatus(workout.id, 'skipped');
    setSheetOpen(false);
  };

  const openWorkoutDetail = (workout: Workout) => {
    setSelectedWorkout(workout);
    setSheetOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">
              Hey {data.profile?.firstName || 'Athlete'} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={generatePlan}
            disabled={loading}
            className="hidden sm:flex"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerate Plan
          </Button>
        </div>

        {/* This Week Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Weekly Progress</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-display font-bold mb-2">
              {weekCompleted} <span className="text-muted-foreground text-lg font-normal">/ {weekTotal}</span>
            </div>
            <Progress value={weekProgress} className="h-2 mb-2" indicatorClassName="bg-hero-gradient" />
            <p className="text-sm text-muted-foreground">
              {weekTotal - weekCompleted} sessions remaining this week
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Training Volume</h3>
              <Clock className="w-5 h-5 text-swim" />
            </div>
            <div className="text-3xl font-display font-bold mb-1">
              {totalWeekHours.toFixed(1)}h
            </div>
            <p className="text-sm text-muted-foreground">
              Planned this week
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Running Distance</h3>
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-display font-bold mb-1">
              {totalWeekDistance}km
            </div>
            <p className="text-sm text-muted-foreground">
              Planned run volume
            </p>
          </div>
        </div>

        {/* Today's Workout */}
        {todayWorkout && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4">Today's Workout</h2>
            <WorkoutCard
              workout={todayWorkout}
              showDate
              onComplete={() => handleComplete(todayWorkout)}
              onSkip={() => handleSkip(todayWorkout)}
              onClick={() => openWorkoutDetail(todayWorkout)}
            />
          </section>
        )}

        {/* Weekly Strip */}
        <WeeklyStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Selected Date Workouts */}
        {!isSameDay(selectedDate, new Date()) && selectedDateWorkouts.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            <div className="space-y-3">
              {selectedDateWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  compact
                  onClick={() => openWorkoutDetail(workout)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming This Week */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Upcoming This Week</h2>
          <div className="space-y-3">
            {weekWorkouts
              .filter(w => w.status === 'planned' && w.type !== 'rest' && new Date(w.date) > new Date())
              .slice(0, 4)
              .map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  compact
                  showDate
                  onClick={() => openWorkoutDetail(workout)}
                />
              ))}
            {weekWorkouts.filter(w => w.status === 'planned' && w.type !== 'rest' && new Date(w.date) > new Date()).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No more workouts this week. Enjoy your rest! 🎉
              </p>
            )}
          </div>
        </section>
      </div>

      <WorkoutDetailSheet
        workout={selectedWorkout}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onComplete={selectedWorkout ? () => handleComplete(selectedWorkout) : undefined}
        onSkip={selectedWorkout ? () => handleSkip(selectedWorkout) : undefined}
      />
    </DashboardLayout>
  );
}
