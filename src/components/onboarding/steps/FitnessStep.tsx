import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Zap, HelpCircle, Calculator } from 'lucide-react';
import { FitnessLevel, SwimLevel } from '@/types/training';

const fitnessLevels: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to endurance sports, less than 1 year of consistent training' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years of training, completed a few races' },
  { value: 'advanced', label: 'Advanced', description: '3+ years of training, multiple races, structured training history' },
  { value: 'elite', label: 'Elite', description: 'Competitive athlete, podium placements, high training volume' },
];

const swimLevels: { value: SwimLevel; label: string }[] = [
  { value: 'cant-swim', label: "Can't swim" },
  { value: 'learning', label: 'Learning basics' },
  { value: 'comfortable', label: 'Comfortable in water' },
  { value: 'competitive', label: 'Competitive swimmer' },
];

export function FitnessStep() {
  const { data, updateFitness, setCurrentStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useEstimate, setUseEstimate] = useState(false);

  const estimateMaxHR = () => {
    const age = data.profile?.age || 30;
    return 220 - age;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.fitness?.fitnessLevel) newErrors.fitnessLevel = 'Please select your fitness level';
    if (!data.fitness?.swimLevel) newErrors.swimLevel = 'Please select your swim level';
    if (!data.fitness?.maxHR || data.fitness.maxHR < 120 || data.fitness.maxHR > 220) {
      newErrors.maxHR = 'Max HR must be between 120 and 220 bpm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setCurrentStep(3);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-2">Fitness Assessment</h2>
        <p className="text-muted-foreground">
          Help us understand your current fitness level to create the perfect plan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Fitness Level */}
        <div className="space-y-2">
          <Label>Current Fitness Level</Label>
          <div className="grid grid-cols-2 gap-3">
            {fitnessLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => updateFitness({ fitnessLevel: level.value })}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${data.fitness?.fitnessLevel === level.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-card'}
                `}
              >
                <p className="font-medium">{level.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
              </button>
            ))}
          </div>
          {errors.fitnessLevel && <p className="text-xs text-destructive">{errors.fitnessLevel}</p>}
        </div>

        {/* Max Heart Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="maxHR">Maximum Heart Rate (bpm)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover border-border">
                  <p>Your maximum heart rate is the highest number of beats per minute your heart can reach during intense exercise. If you don't know it, we can estimate using the 220-age formula.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Input
              id="maxHR"
              type="number"
              placeholder="185"
              value={data.fitness?.maxHR || ''}
              onChange={(e) => updateFitness({ maxHR: parseInt(e.target.value) || undefined })}
              className={`flex-1 ${errors.maxHR ? 'border-destructive' : ''}`}
            />
            <Button
              variant="outline"
              onClick={() => {
                updateFitness({ maxHR: estimateMaxHR() });
                setUseEstimate(true);
              }}
              className="shrink-0"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Estimate
            </Button>
          </div>
          {useEstimate && data.fitness?.maxHR && (
            <p className="text-xs text-muted-foreground">
              Estimated at {data.fitness.maxHR} bpm based on your age
            </p>
          )}
          {errors.maxHR && <p className="text-xs text-destructive">{errors.maxHR}</p>}
        </div>

        {/* LTHR */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="lthr">Lactate Threshold HR (bpm)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover border-border">
                  <p>Your lactate threshold HR is approximately your average HR during a 30-minute all-out effort. Typically around 85-90% of max HR. Leave blank if unknown.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="lthr"
            type="number"
            placeholder="172 (optional)"
            value={data.fitness?.lthr || ''}
            onChange={(e) => updateFitness({ lthr: parseInt(e.target.value) || undefined })}
          />
        </div>

        {/* Threshold Pace */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="thresholdPace">Threshold Running Pace (min:sec per km)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover border-border">
                  <p>Your threshold pace is approximately your pace for a 60-minute all-out effort. Format: MM:SS (e.g., 4:45 for 4 minutes 45 seconds per km)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="thresholdPace"
            placeholder="5:00 (optional)"
            value={data.fitness?.thresholdPace || ''}
            onChange={(e) => updateFitness({ thresholdPace: e.target.value })}
          />
        </div>

        {/* Swim Level */}
        <div className="space-y-2">
          <Label>Swimming Ability</Label>
          <Select
            value={data.fitness?.swimLevel}
            onValueChange={(value: SwimLevel) => updateFitness({ swimLevel: value })}
          >
            <SelectTrigger className={errors.swimLevel ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your swim level" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {swimLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.swimLevel && <p className="text-xs text-destructive">{errors.swimLevel}</p>}
        </div>

        {/* FTP (optional) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ftp">Cycling FTP (watts)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover border-border">
                  <p>Functional Threshold Power - your average power for a 60-minute all-out cycling effort. Only needed if you're training for triathlon and have a power meter.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="ftp"
            type="number"
            placeholder="200 (optional)"
            value={data.fitness?.ftp || ''}
            onChange={(e) => updateFitness({ ftp: parseInt(e.target.value) || undefined })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(1)} size="lg" className="flex-1">
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
