import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTraining } from '@/contexts/TrainingContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Link as LinkIcon, Calendar, Activity, CheckCircle2, Loader2 } from 'lucide-react';

export function IntegrationsStep() {
  const { data, updateIntegrations, setCurrentStep, completeOnboarding } = useOnboarding();
  const { generatePlan, loading } = useTraining();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleConnectGoogle = () => {
    // Simulate OAuth connection
    updateIntegrations({
      googleCalendar: {
        ...data.integrations?.googleCalendar,
        connected: true,
        readCalendar: 'Personal',
        writeCalendar: 'Training',
      },
    });
  };

  const handleConnectStrava = () => {
    // Simulate OAuth connection
    updateIntegrations({
      strava: {
        ...data.integrations?.strava,
        connected: true,
      },
    });
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    await generatePlan();
    completeOnboarding();
    setIsGenerating(false);
  };

  const googleConnected = data.integrations?.googleCalendar?.connected;
  const stravaConnected = data.integrations?.strava?.connected;

  return (
    <div className="space-y-8">
      <div>
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <LinkIcon className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-2">Connect Your Apps</h2>
        <p className="text-muted-foreground">
          Sync with Google Calendar and Strava for a seamless training experience. You can skip this and connect later.
        </p>
      </div>

      <div className="space-y-4">
        {/* Google Calendar */}
        <div className={`
          p-6 rounded-2xl border transition-all
          ${googleConnected ? 'border-success/50 bg-success/5' : 'border-border bg-card'}
        `}>
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${googleConnected ? 'bg-success/20' : 'bg-muted'}
            `}>
              <Calendar className={`w-6 h-6 ${googleConnected ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Google Calendar</h3>
                {googleConnected && <CheckCircle2 className="w-4 h-4 text-success" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Sync workouts to your calendar and check for scheduling conflicts.
              </p>
              {googleConnected ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-success">✓ Connected to Google Account</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avoid conflicts with existing events</span>
                    <Switch
                      checked={data.integrations?.googleCalendar?.avoidConflicts ?? true}
                      onCheckedChange={(checked) => updateIntegrations({
                        googleCalendar: { ...data.integrations?.googleCalendar, avoidConflicts: checked },
                      })}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleConnectGoogle}
                  variant="outline"
                  className="mt-4"
                >
                  Connect Google Calendar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Strava */}
        <div className={`
          p-6 rounded-2xl border transition-all
          ${stravaConnected ? 'border-[#FC4C02]/50 bg-[#FC4C02]/5' : 'border-border bg-card'}
        `}>
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${stravaConnected ? 'bg-[#FC4C02]/20' : 'bg-muted'}
            `}>
              <Activity className={`w-6 h-6 ${stravaConnected ? 'text-[#FC4C02]' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Strava</h3>
                {stravaConnected && <CheckCircle2 className="w-4 h-4 text-[#FC4C02]" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically track completed workouts from your Strava activities.
              </p>
              {stravaConnected ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[#FC4C02]">✓ Connected to Strava</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auto-complete matching workouts</span>
                    <Switch
                      checked={data.integrations?.strava?.autoComplete ?? true}
                      onCheckedChange={(checked) => updateIntegrations({
                        strava: { ...data.integrations?.strava, autoComplete: checked },
                      })}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleConnectStrava}
                  variant="outline"
                  className="mt-4"
                >
                  Connect Strava
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-2">Ready to create your plan?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our AI will analyze your profile, goals, and availability to create a personalized 4-week training plan.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep(4)} size="lg" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleComplete} 
            size="lg" 
            className="flex-1 bg-hero-gradient hover:opacity-90 transition-opacity"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Generate My Plan'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
