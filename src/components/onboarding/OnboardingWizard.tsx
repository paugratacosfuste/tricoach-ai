import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { ProfileStep } from './steps/ProfileStep';
import { FitnessStep } from './steps/FitnessStep';
import { GoalStep } from './steps/GoalStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { IntegrationsStep } from './steps/IntegrationsStep';
import { Activity, Target, Calendar, Zap, Link } from 'lucide-react';

const steps = [
  { id: 1, title: 'Profile', icon: Activity, description: 'Tell us about yourself' },
  { id: 2, title: 'Fitness', icon: Zap, description: 'Your current fitness level' },
  { id: 3, title: 'Goal', icon: Target, description: 'Set your race goal' },
  { id: 4, title: 'Schedule', icon: Calendar, description: 'Weekly availability' },
  { id: 5, title: 'Connect', icon: Link, description: 'Link your accounts' },
];

export function OnboardingWizard() {
  const { currentStep } = useOnboarding();
  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ProfileStep />;
      case 2: return <FitnessStep />;
      case 3: return <GoalStep />;
      case 4: return <AvailabilityStep />;
      case 5: return <IntegrationsStep />;
      default: return <ProfileStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Progress */}
      <div className="hidden lg:flex w-80 bg-card border-r border-border flex-col p-8">
        <div className="mb-12">
          <h1 className="font-display text-2xl font-bold gradient-text">TriCoach AI</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your personal training coach</p>
        </div>

        <div className="flex-1">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-primary text-primary-foreground glow-effect' : ''}
                    ${isCompleted ? 'bg-primary/20 text-primary' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="text-xs text-muted-foreground mb-2">
            Step {currentStep} of {steps.length}
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-hero-gradient" />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Progress */}
        <div className="lg:hidden p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-lg font-bold gradient-text">TriCoach AI</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" indicatorClassName="bg-hero-gradient" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
