// src/components/onboarding/steps/IntegrationsStep.tsx
//
// PURPOSE: Final step of onboarding.
// Shows integration options (Google Calendar, Strava) and triggers plan generation.
// Connects to the new initializePlan function that generates week 1.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTraining } from '@/contexts/TrainingContext';
import { OnboardingData } from '@/types/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar, Activity, CheckCircle2, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  onConnect: () => void;
  toggleLabel?: string;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function IntegrationCard({
  icon,
  title,
  description,
  connected,
  onConnect,
  toggleLabel,
  toggleValue,
  onToggle,
}: IntegrationCardProps) {
  return (
    <Card className={connected ? 'border-green-500/50 bg-green-500/5' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${connected ? 'bg-green-500/10' : 'bg-muted'}`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{title}</h3>
              {connected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>

            {!connected ? (
              <Button variant="outline" size="sm" onClick={onConnect}>
                Connect
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Connected
                </p>
                {toggleLabel && onToggle && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{toggleLabel}</span>
                    <Switch checked={toggleValue} onCheckedChange={onToggle} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function IntegrationsStep() {
  const navigate = useNavigate();
  const { data, updateData, previousStep } = useOnboarding();
  const { initializePlan } = useTraining();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated connection states (will be real OAuth later)
  const [googleConnected, setGoogleConnected] = useState(
    data.integrations?.googleCalendar?.connected || false
  );
  const [stravaConnected, setStravaConnected] = useState(
    data.integrations?.strava?.connected || false
  );
  const [avoidConflicts, setAvoidConflicts] = useState(
    data.integrations?.googleCalendar?.avoidConflicts ?? true
  );
  const [autoComplete, setAutoComplete] = useState(
    data.integrations?.strava?.autoComplete ?? true
  );

  // Handle Google Calendar connection (simulated for now)
  const handleGoogleConnect = () => {
    // TODO: Implement real OAuth flow
    setGoogleConnected(true);
    updateData({
      integrations: {
        ...data.integrations,
        googleCalendar: {
          connected: true,
          avoidConflicts: true,
        },
        strava: data.integrations?.strava || { connected: false, autoComplete: false },
      },
    });
  };

  // Handle Strava connection (simulated for now)
  const handleStravaConnect = () => {
    // TODO: Implement real OAuth flow
    setStravaConnected(true);
    updateData({
      integrations: {
        ...data.integrations,
        googleCalendar: data.integrations?.googleCalendar || {
          connected: false,
          avoidConflicts: false,
        },
        strava: {
          connected: true,
          autoComplete: true,
        },
      },
    });
  };

  // Handle form completion and plan generation
  const handleComplete = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build the complete onboarding data
      const completeData: OnboardingData = {
        profile: data.profile!,
        fitness: data.fitness!,
        goal: {
          ...data.goal!,
          raceDate: new Date(data.goal!.raceDate),
        },
        availability: data.availability!,
        integrations: {
          googleCalendar: {
            connected: googleConnected,
            avoidConflicts,
          },
          strava: {
            connected: stravaConnected,
            autoComplete,
          },
        },
      };

      console.log('Starting plan initialization with data:', completeData);

      // Initialize the plan (generates week 1)
      await initializePlan(completeData);

      console.log('Plan initialized successfully!');

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate training plan';
      console.error('Error generating plan:', message);
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Apps</h2>
        <p className="text-muted-foreground">
          Sync with Google Calendar and Strava for a seamless training experience.
          You can skip this and connect later.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        <IntegrationCard
          icon={<Calendar className="w-6 h-6 text-blue-500" />}
          title="Google Calendar"
          description="Sync workouts to your calendar and check for scheduling conflicts."
          connected={googleConnected}
          onConnect={handleGoogleConnect}
          toggleLabel="Avoid conflicts with existing events"
          toggleValue={avoidConflicts}
          onToggle={(value) => {
            setAvoidConflicts(value);
            updateData({
              integrations: {
                ...data.integrations,
                googleCalendar: {
                  ...data.integrations?.googleCalendar,
                  connected: googleConnected,
                  avoidConflicts: value,
                },
                strava: data.integrations?.strava || { connected: false, autoComplete: false },
              },
            });
          }}
        />

        <IntegrationCard
          icon={<Activity className="w-6 h-6 text-orange-500" />}
          title="Strava"
          description="Automatically track completed workouts from your Strava activities."
          connected={stravaConnected}
          onConnect={handleStravaConnect}
          toggleLabel="Auto-complete matching workouts"
          toggleValue={autoComplete}
          onToggle={(value) => {
            setAutoComplete(value);
            updateData({
              integrations: {
                ...data.integrations,
                googleCalendar: data.integrations?.googleCalendar || {
                  connected: false,
                  avoidConflicts: false,
                },
                strava: {
                  ...data.integrations?.strava,
                  connected: stravaConnected,
                  autoComplete: value,
                },
              },
            });
          }}
        />
      </div>

      {/* Ready to Generate */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Ready to create your plan?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our AI will analyze your profile, goals, and availability to create a personalized
            training week. Each week, you'll review your progress and get a fresh plan adapted
            to how you're feeling.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Week 1 will be generated now</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Future weeks adapt based on your feedback</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please check your internet connection and try again.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={isGenerating}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Week 1...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Plan
            </>
          )}
        </Button>
      </div>

      {/* Generation Info */}
      {isGenerating && (
        <p className="text-xs text-center text-muted-foreground">
          This may take 10-15 seconds. We're creating detailed, personalized workouts just for you.
        </p>
      )}
    </div>
  );
}

export default IntegrationsStep;