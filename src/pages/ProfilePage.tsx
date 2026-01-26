import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Activity, Target, Heart, Gauge } from 'lucide-react';

const fitnessLevelLabels: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'elite': 'Elite',
};

const swimLevelLabels: Record<string, string> = {
  'cant-swim': "Can't swim",
  'learning': 'Learning',
  'comfortable': 'Comfortable',
  'competitive': 'Competitive',
};

export function ProfilePage() {
  const { data, updateProfile, updateFitness } = useOnboarding();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and fitness metrics
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{data.profile?.firstName || 'Athlete'}</h2>
              <p className="text-muted-foreground">
                {data.fitness?.fitnessLevel && fitnessLevelLabels[data.fitness.fitnessLevel]} Athlete
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={data.profile?.firstName || ''}
                onChange={(e) => updateProfile({ firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={data.profile?.age || ''}
                onChange={(e) => updateProfile({ age: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={data.profile?.weight || ''}
                onChange={(e) => updateProfile({ weight: parseFloat(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={data.profile?.height || ''}
                onChange={(e) => updateProfile({ height: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>
        </div>

        {/* Fitness Metrics */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Fitness Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-destructive" />
                  <span className="text-sm">Max Heart Rate</span>
                </div>
                <span className="font-semibold">{data.fitness?.maxHR || '—'} bpm</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="text-sm">Lactate Threshold HR</span>
                </div>
                <span className="font-semibold">{data.fitness?.lthr || '—'} bpm</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-bike" />
                  <span className="text-sm">Cycling FTP</span>
                </div>
                <span className="font-semibold">{data.fitness?.ftp || '—'} watts</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm">Threshold Pace</span>
                </div>
                <span className="font-semibold">{data.fitness?.thresholdPace || '—'} /km</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-success" />
                  <span className="text-sm">Fitness Level</span>
                </div>
                <span className="font-semibold">
                  {data.fitness?.fitnessLevel ? fitnessLevelLabels[data.fitness.fitnessLevel] : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏊</span>
                  <span className="text-sm">Swimming Level</span>
                </div>
                <span className="font-semibold">
                  {data.fitness?.swimLevel ? swimLevelLabels[data.fitness.swimLevel] : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxHR">Max Heart Rate (bpm)</Label>
              <Input
                id="maxHR"
                type="number"
                value={data.fitness?.maxHR || ''}
                onChange={(e) => updateFitness({ maxHR: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lthr">Lactate Threshold HR (bpm)</Label>
              <Input
                id="lthr"
                type="number"
                value={data.fitness?.lthr || ''}
                onChange={(e) => updateFitness({ lthr: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thresholdPace">Threshold Pace (min:sec/km)</Label>
              <Input
                id="thresholdPace"
                value={data.fitness?.thresholdPace || ''}
                onChange={(e) => updateFitness({ thresholdPace: e.target.value })}
                placeholder="5:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ftp">Cycling FTP (watts)</Label>
              <Input
                id="ftp"
                type="number"
                value={data.fitness?.ftp || ''}
                onChange={(e) => updateFitness({ ftp: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>

          <Button className="mt-6 bg-hero-gradient hover:opacity-90">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
