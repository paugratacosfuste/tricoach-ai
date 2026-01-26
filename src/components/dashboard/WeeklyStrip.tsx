import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Workout, WorkoutType } from '@/types/training';
import { useTraining } from '@/contexts/TrainingContext';

const workoutIcons: Record<WorkoutType, string> = {
  run: '🏃',
  bike: '🚴',
  swim: '🏊',
  strength: '💪',
  rest: '😴',
};

interface WeeklyStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeeklyStrip({ selectedDate, onSelectDate }: WeeklyStripProps) {
  const { getWorkoutsForDate } = useTraining();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">This Week</h3>
        <span className="text-sm text-muted-foreground">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const workouts = getWorkoutsForDate(day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isPast = day < today && !isToday;
          
          const hasCompleted = workouts.some(w => w.status === 'completed');
          const hasSkipped = workouts.some(w => w.status === 'skipped');
          const hasPlanned = workouts.some(w => w.status === 'planned');

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                flex flex-col items-center p-2 rounded-xl transition-all
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${isToday && !isSelected ? 'bg-primary/10 ring-2 ring-primary' : ''}
                ${!isSelected && !isToday ? 'hover:bg-muted' : ''}
                ${isPast && !isSelected ? 'opacity-60' : ''}
              `}
            >
              <span className="text-xs font-medium mb-1">
                {format(day, 'EEE')}
              </span>
              <span className={`
                text-lg font-bold mb-2
                ${isSelected ? '' : isToday ? 'text-primary' : ''}
              `}>
                {format(day, 'd')}
              </span>
              
              {/* Workout indicators */}
              <div className="flex gap-1 min-h-[24px] flex-wrap justify-center">
                {workouts.length === 0 ? (
                  <span className="text-lg opacity-50">{workoutIcons.rest}</span>
                ) : (
                  workouts.slice(0, 2).map((w, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        w.status === 'completed' ? 'opacity-60' : ''
                      } ${w.status === 'skipped' ? 'opacity-30 line-through' : ''}`}
                    >
                      {workoutIcons[w.type]}
                    </span>
                  ))
                )}
              </div>
              
              {/* Status dot */}
              <div className={`
                w-2 h-2 rounded-full mt-1
                ${hasCompleted ? 'bg-success' : ''}
                ${hasSkipped && !hasCompleted ? 'bg-destructive' : ''}
                ${hasPlanned && !hasCompleted && !hasSkipped ? 'bg-primary/50' : ''}
                ${workouts.length === 0 ? 'bg-muted' : ''}
              `} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
