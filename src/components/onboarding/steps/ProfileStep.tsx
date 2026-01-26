import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, User } from 'lucide-react';

export function ProfileStep() {
  const { data, updateProfile, setCurrentStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.profile?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!data.profile?.age || data.profile.age < 13 || data.profile.age > 99) {
      newErrors.age = 'Age must be between 13 and 99';
    }
    if (!data.profile?.gender) newErrors.gender = 'Please select your gender';
    if (!data.profile?.weight || data.profile.weight < 30 || data.profile.weight > 200) {
      newErrors.weight = 'Weight must be between 30 and 200 kg';
    }
    if (!data.profile?.height || data.profile.height < 100 || data.profile.height > 250) {
      newErrors.height = 'Height must be between 100 and 250 cm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-2">Let's get to know you</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself so we can personalize your training plan.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={data.profile?.firstName || ''}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={data.profile?.age || ''}
              onChange={(e) => updateProfile({ age: parseInt(e.target.value) || undefined })}
              className={errors.age ? 'border-destructive' : ''}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={data.profile?.gender}
              onValueChange={(value: any) => updateProfile({ gender: value })}
            >
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70"
              value={data.profile?.weight || ''}
              onChange={(e) => updateProfile({ weight: parseFloat(e.target.value) || undefined })}
              className={errors.weight ? 'border-destructive' : ''}
            />
            {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={data.profile?.height || ''}
              onChange={(e) => updateProfile({ height: parseInt(e.target.value) || undefined })}
              className={errors.height ? 'border-destructive' : ''}
            />
            {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
          </div>
        </div>
      </div>

      <Button onClick={handleNext} size="lg" className="w-full bg-hero-gradient hover:opacity-90 transition-opacity">
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
