import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { format, differenceInWeeks, differenceInDays } from 'date-fns';
import { Target, Calendar, Trophy, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const raceTypeLabels: Record<string, string> = {
  'marathon': 'Marathon',
  'half-marathon': 'Half Marathon',
  'sprint-triathlon': 'Sprint Triathlon',
  'olympic-triathlon': 'Olympic Triathlon',
  '70.3-ironman': 'Ironman 70.3',
  'full-ironman': 'Ironman',
};

const raceDistances: Record<string, { swim?: string; bike?: string; run: string }> = {
  'marathon': { run: '42.195km' },
  'half-marathon': { run: '21.1km' },
  'sprint-triathlon': { swim: '750m', bike: '20km', run: '5km' },
  'olympic-triathlon': { swim: '1.5km', bike: '40km', run: '10km' },
  '70.3-ironman': { swim: '1.9km', bike: '90km', run: '21.1km' },
  'full-ironman': { swim: '3.8km', bike: '180km', run: '42.2km' },
};

export function GoalsPage() {
  const { data } = useOnboarding();
  const goal = data.goal;

  if (!goal?.raceDate) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">No Race Goal Set</h2>
            <p className="text-muted-foreground">
              Set a race goal in settings to see your training countdown.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const raceDate = new Date(goal.raceDate);
  const today = new Date();
  const weeksOut = differenceInWeeks(raceDate, today);
  const daysOut = differenceInDays(raceDate, today);
  const distances = goal.raceType ? raceDistances[goal.raceType] : null;

  // Training phases
  const phases = [
    { name: 'Base Building', weeksRange: '16+ weeks', description: 'Building aerobic foundation' },
    { name: 'Build Phase 1', weeksRange: '12-16 weeks', description: 'Increasing volume and intensity' },
    { name: 'Build Phase 2', weeksRange: '8-12 weeks', description: 'Race-specific preparation' },
    { name: 'Peak/Race-Specific', weeksRange: '4-8 weeks', description: 'High intensity, race simulation' },
    { name: 'Taper', weeksRange: '0-4 weeks', description: 'Reducing volume, maintaining intensity' },
  ];

  const getCurrentPhase = () => {
    if (weeksOut > 16) return 0;
    if (weeksOut > 12) return 1;
    if (weeksOut > 8) return 2;
    if (weeksOut > 4) return 3;
    return 4;
  };

  const currentPhaseIndex = getCurrentPhase();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Race Goal</h1>
          <p className="text-muted-foreground mt-1">
            Your training journey towards race day
          </p>
        </div>

        {/* Race Card */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl border border-primary/30 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏁</span>
                <div>
                  <p className="text-sm text-primary font-medium">
                    {goal.raceType && raceTypeLabels[goal.raceType]}
                  </p>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold">
                    {goal.raceName}
                  </h2>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(raceDate, 'EEEE, MMMM d, yyyy')}
                </div>
                {goal.goalTime && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Target: {goal.goalTime}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  {goal.priority === 'finish' ? 'Finish Strong' : ''}
                  {goal.priority === 'pb' ? 'Personal Best' : ''}
                  {goal.priority === 'podium' ? 'Podium Finish' : ''}
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="text-5xl lg:text-6xl font-display font-bold text-primary">
                {daysOut}
              </div>
              <p className="text-muted-foreground">days to go</p>
            </div>
          </div>
        </div>

        {/* Race Distances */}
        {distances && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {distances.swim && (
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <span className="text-3xl mb-2 block">🏊</span>
                <p className="text-sm text-muted-foreground">Swim</p>
                <p className="text-2xl font-display font-bold text-swim">{distances.swim}</p>
              </div>
            )}
            {distances.bike && (
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <span className="text-3xl mb-2 block">🚴</span>
                <p className="text-sm text-muted-foreground">Bike</p>
                <p className="text-2xl font-display font-bold text-bike">{distances.bike}</p>
              </div>
            )}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <span className="text-3xl mb-2 block">🏃</span>
              <p className="text-sm text-muted-foreground">Run</p>
              <p className="text-2xl font-display font-bold text-primary">{distances.run}</p>
            </div>
          </div>
        )}

        {/* Training Phases */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Training Timeline
          </h3>

          <div className="space-y-4">
            {phases.map((phase, index) => {
              const isActive = index === currentPhaseIndex;
              const isPast = index > currentPhaseIndex;
              
              return (
                <div
                  key={phase.name}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl transition-all
                    ${isActive ? 'bg-primary/10 border border-primary/30' : ''}
                    ${isPast ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{phase.name}</h4>
                      <span className="text-sm text-muted-foreground">{phase.weeksRange}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                    {isActive && (
                      <p className="text-sm text-primary mt-2 font-medium">
                        ← You are here ({weeksOut} weeks out)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Countdown Progress */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Journey Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Training Started</span>
              <span className="text-muted-foreground">Race Day</span>
            </div>
            <Progress 
              value={100 - (daysOut / 120) * 100} 
              className="h-3" 
              indicatorClassName="bg-hero-gradient"
            />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {Math.round(100 - (daysOut / 120) * 100)}% of your training journey complete
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
