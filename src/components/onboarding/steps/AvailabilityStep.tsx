import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Calendar, Sun, Clock, Moon, Star } from 'lucide-react';
import { DayAvailability, TimeSlot, Duration } from '@/types/training';

const days = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

const timeSlots: { value: TimeSlot; label: string; icon: any }[] = [
  { value: 'morning', label: 'Morning (6-9am)', icon: Sun },
  { value: 'midday', label: 'Midday (12-2pm)', icon: Clock },
  { value: 'evening', label: 'Evening (6-9pm)', icon: Moon },
];

const durations: { value: Duration; label: string }[] = [
  { value: '30min', label: '30 min' },
  { value: '45min', label: '45 min' },
  { value: '60min', label: '1 hour' },
  { value: '90min', label: '1.5 hours' },
  { value: '2h', label: '2 hours' },
  { value: '2h30', label: '2.5 hours' },
  { value: '3h+', label: '3+ hours' },
];

const weeklyHoursOptions = ['5-7h', '8-10h', '11-14h', '15-20h', '20h+'];

export function AvailabilityStep() {
  const { data, updateAvailability, setCurrentStep } = useOnboarding();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const getDayAvailability = (dayKey: string): DayAvailability => {
    return (data.availability as any)?.[dayKey] || {
      available: false,
      timeSlots: [],
      maxDuration: '60min',
    };
  };

  const toggleDay = (dayKey: string) => {
    const current = getDayAvailability(dayKey);
    updateAvailability({
      [dayKey]: {
        ...current,
        available: !current.available,
        timeSlots: !current.available ? ['evening'] : [],
      },
    } as any);
  };

  const toggleTimeSlot = (dayKey: string, slot: TimeSlot) => {
    const current = getDayAvailability(dayKey);
    const newSlots = current.timeSlots.includes(slot)
      ? current.timeSlots.filter(s => s !== slot)
      : [...current.timeSlots, slot];
    updateAvailability({
      [dayKey]: { ...current, timeSlots: newSlots },
    } as any);
  };

  const setDuration = (dayKey: string, duration: Duration) => {
    const current = getDayAvailability(dayKey);
    updateAvailability({
      [dayKey]: { ...current, maxDuration: duration },
    } as any);
  };

  const toggleLongSession = (dayKey: string) => {
    const current = getDayAvailability(dayKey);
    updateAvailability({
      [dayKey]: { ...current, longSession: !current.longSession },
    } as any);
  };

  const handleNext = () => {
    setCurrentStep(5);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Calendar className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-2">Weekly Schedule</h2>
        <p className="text-muted-foreground">
          Tell us when you can train so we can build a realistic plan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Weekly Hours Target */}
        <div className="space-y-2">
          <Label>Weekly Training Hours Target</Label>
          <Select
            value={data.availability?.weeklyHoursTarget || '8-10h'}
            onValueChange={(value) => updateAvailability({ weeklyHoursTarget: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {weeklyHoursOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} per week
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Daily Availability */}
        <div className="space-y-3">
          <Label>Daily Availability</Label>
          <div className="space-y-2">
            {days.map((day) => {
              const availability = getDayAvailability(day.key);
              const isExpanded = expandedDay === day.key;

              return (
                <div
                  key={day.key}
                  className={`
                    rounded-xl border transition-all
                    ${availability.available ? 'border-primary/50 bg-card' : 'border-border'}
                  `}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedDay(isExpanded ? null : day.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={availability.available}
                        onCheckedChange={() => toggleDay(day.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={`font-medium ${!availability.available ? 'text-muted-foreground' : ''}`}>
                        {day.label}
                      </span>
                      {availability.longSession && (
                        <Star className="w-4 h-4 text-primary fill-primary" />
                      )}
                    </div>
                    {availability.available && (
                      <span className="text-sm text-muted-foreground">
                        {availability.maxDuration} • {availability.timeSlots.length} slot(s)
                      </span>
                    )}
                  </div>

                  {availability.available && isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Time Slots */}
                      <div className="space-y-2">
                        <Label className="text-xs">Available Times</Label>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.map((slot) => {
                            const Icon = slot.icon;
                            const isSelected = availability.timeSlots.includes(slot.value);
                            return (
                              <button
                                key={slot.value}
                                onClick={() => toggleTimeSlot(day.key, slot.value)}
                                className={`
                                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                                  ${isSelected 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted hover:bg-muted/80'}
                                `}
                              >
                                <Icon className="w-4 h-4" />
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Max Duration */}
                      <div className="space-y-2">
                        <Label className="text-xs">Max Duration</Label>
                        <Select
                          value={availability.maxDuration}
                          onValueChange={(value: Duration) => setDuration(day.key, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {durations.map((dur) => (
                              <SelectItem key={dur.value} value={dur.value}>
                                {dur.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Long Session */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Long Session Day</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark this day for longer runs/rides (2h+)
                          </p>
                        </div>
                        <Switch
                          checked={availability.longSession || false}
                          onCheckedChange={() => toggleLongSession(day.key)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(3)} size="lg" className="flex-1">
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
