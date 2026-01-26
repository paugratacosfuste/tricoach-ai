import { Workout, WorkoutType } from '@/types/training';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Clock, MapPin, Heart, Gauge, Lightbulb, AlertTriangle, Check, X } from 'lucide-react';

const workoutIcons: Record<WorkoutType, string> = {
  run: '🏃',
  bike: '🚴',
  swim: '🏊',
  strength: '💪',
  rest: '😴',
};

interface WorkoutDetailSheetProps {
  workout: Workout | null;
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function WorkoutDetailSheet({ 
  workout, 
  open, 
  onClose,
  onComplete,
  onSkip 
}: WorkoutDetailSheetProps) {
  if (!workout) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background border-border">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{workoutIcons[workout.type]}</span>
            <div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(workout.date), 'EEEE, MMMM d')}
              </p>
              <SheetTitle className="font-display text-2xl">
                {workout.name}
              </SheetTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {workout.duration}min
            </span>
            {workout.distance && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {workout.distance}km
              </span>
            )}
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${workout.status === 'completed' ? 'bg-success/20 text-success' : ''}
              ${workout.status === 'skipped' ? 'bg-destructive/20 text-destructive' : ''}
              ${workout.status === 'planned' ? 'bg-primary/20 text-primary' : ''}
            `}>
              {workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Purpose */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
              🎯 PURPOSE
            </h4>
            <p className="text-sm text-muted-foreground">{workout.purpose}</p>
          </section>

          {/* Structure */}
          {workout.structure.length > 0 && (
            <section className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                📋 STRUCTURE
              </h4>
              <div className="space-y-3">
                {workout.structure.map((segment, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {segment.name} <span className="text-muted-foreground">({segment.duration})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{segment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Heart Rate Guidance */}
          {workout.heartRateGuidance && (
            <section className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                HEART RATE ZONES
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {workout.heartRateGuidance}
              </p>
            </section>
          )}

          {/* Pace Guidance */}
          {workout.paceGuidance && (
            <section className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4" />
                PACE GUIDANCE
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {workout.paceGuidance}
              </p>
            </section>
          )}

          {/* Coaching Tips */}
          {workout.coachingTips.length > 0 && (
            <section className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" />
                COACHING TIPS
              </h4>
              <ul className="space-y-2">
                {workout.coachingTips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Adaptation Notes */}
          {workout.adaptationNotes && (
            <section className="bg-warning/10 rounded-xl p-4 border border-warning/30">
              <h4 className="text-sm font-semibold text-warning flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                ADAPTATION NOTES
              </h4>
              <p className="text-sm text-muted-foreground">{workout.adaptationNotes}</p>
            </section>
          )}

          {/* Actions */}
          {workout.status === 'planned' && (
            <div className="flex gap-3 pt-4">
              {onComplete && (
                <Button
                  onClick={onComplete}
                  className="flex-1 bg-hero-gradient hover:opacity-90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Done
                </Button>
              )}
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
