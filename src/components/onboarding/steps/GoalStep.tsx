import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, ArrowRight, Target, CalendarIcon, Trophy, Clock, Medal } from 'lucide-react';
import { RaceType, GoalPriority } from '@/types/training';
import { format, addMonths, isBefore, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';

const raceTypes: { value: RaceType; label: string; description: string }[] = [
  { value: 'marathon', label: 'Marathon', description: '42.195km' },
  { value: 'half-marathon', label: 'Half Marathon', description: '21.1km' },
  { value: 'sprint-triathlon', label: 'Sprint Triathlon', description: '750m | 20km | 5km' },
  { value: 'olympic-triathlon', label: 'Olympic Triathlon', description: '1.5km | 40km | 10km' },
  { value: '70.3-ironman', label: 'Ironman 70.3', description: '1.9km | 90km | 21.1km' },
  { value: 'full-ironman', label: 'Ironman', description: '3.8km | 180km | 42.2km' },
];

const goalPriorities: { value: GoalPriority; label: string; icon: any; description: string }[] = [
  { value: 'finish', label: 'Finish', icon: Trophy, description: 'Complete the race successfully' },
  { value: 'pb', label: 'Personal Best', icon: Clock, description: 'Beat your previous time' },
  { value: 'podium', label: 'Podium', icon: Medal, description: 'Compete for top placement' },
];

export function GoalStep() {
  const { data, updateGoal, setCurrentStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.goal?.raceType) newErrors.raceType = 'Please select a race type';
    if (!data.goal?.raceName?.trim()) newErrors.raceName = 'Please enter the race name';
    if (!data.goal?.raceDate) {
      newErrors.raceDate = 'Please select a race date';
    } else if (isBefore(new Date(data.goal.raceDate), startOfToday())) {
      newErrors.raceDate = 'Race date must be in the future';
    }
    if (!data.goal?.priority) newErrors.priority = 'Please select your goal priority';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setCurrentStep(4);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-2">Set Your Goal</h2>
        <p className="text-muted-foreground">
          Tell us about the race you're training for. We'll build your plan around this target.
        </p>
      </div>

      <div className="space-y-6">
        {/* Race Type */}
        <div className="space-y-2">
          <Label>Race Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {raceTypes.map((race) => (
              <button
                key={race.value}
                onClick={() => updateGoal({ raceType: race.value })}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${data.goal?.raceType === race.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-card'}
                `}
              >
                <p className="font-medium">{race.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{race.description}</p>
              </button>
            ))}
          </div>
          {errors.raceType && <p className="text-xs text-destructive">{errors.raceType}</p>}
        </div>

        {/* Race Name */}
        <div className="space-y-2">
          <Label htmlFor="raceName">Race Name</Label>
          <Input
            id="raceName"
            placeholder="e.g., Barcelona Marathon 2025"
            value={data.goal?.raceName || ''}
            onChange={(e) => updateGoal({ raceName: e.target.value })}
            className={errors.raceName ? 'border-destructive' : ''}
          />
          {errors.raceName && <p className="text-xs text-destructive">{errors.raceName}</p>}
        </div>

        {/* Race Date */}
        <div className="space-y-2">
          <Label>Race Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.goal?.raceDate && "text-muted-foreground",
                  errors.raceDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.goal?.raceDate ? (
                  format(new Date(data.goal.raceDate), "PPP")
                ) : (
                  <span>Select race date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
              <Calendar
                mode="single"
                selected={data.goal?.raceDate ? new Date(data.goal.raceDate) : undefined}
                onSelect={(date) => date && updateGoal({ raceDate: date })}
                disabled={(date) => isBefore(date, startOfToday())}
                initialFocus
                className="pointer-events-auto"
                defaultMonth={addMonths(new Date(), 3)}
              />
            </PopoverContent>
          </Popover>
          {errors.raceDate && <p className="text-xs text-destructive">{errors.raceDate}</p>}
          {data.goal?.raceDate && (
            <p className="text-xs text-muted-foreground">
              {Math.ceil((new Date(data.goal.raceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7))} weeks until race day
            </p>
          )}
        </div>

        {/* Goal Priority */}
        <div className="space-y-2">
          <Label>Goal Priority</Label>
          <div className="grid grid-cols-3 gap-3">
            {goalPriorities.map((priority) => {
              const Icon = priority.icon;
              return (
                <button
                  key={priority.value}
                  onClick={() => updateGoal({ priority: priority.value })}
                  className={`
                    p-4 rounded-xl border text-center transition-all
                    ${data.goal?.priority === priority.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50 hover:bg-card'}
                  `}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    data.goal?.priority === priority.value ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className="font-medium text-sm">{priority.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{priority.description}</p>
                </button>
              );
            })}
          </div>
          {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
        </div>

        {/* Goal Time (optional) */}
        <div className="space-y-2">
          <Label htmlFor="goalTime">Target Time (optional)</Label>
          <Input
            id="goalTime"
            placeholder="e.g., 3:45:00"
            value={data.goal?.goalTime || ''}
            onChange={(e) => updateGoal({ goalTime: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Format: HH:MM:SS or MM:SS for shorter races
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(2)} size="lg" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="flex-1 bg-hero-gradient hover:opacity-90 transition-opacity">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
