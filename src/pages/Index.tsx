import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTraining } from '@/contexts/TrainingContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import Dashboard from '@/pages/Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const Index = () => {
  const { isComplete, isStarted, startOnboarding } = useOnboarding();
  const { plan } = useTraining();

  console.log('Index render - isStarted:', isStarted, 'isComplete:', isComplete, 'hasPlan:', !!plan);

  // If onboarding is started but not complete, show the wizard
  if (isStarted) {
    console.log('Showing OnboardingWizard');
    return <OnboardingWizard />;
  }

  // If we have a plan, show the dashboard
  if (plan && plan.currentWeek) {
    console.log('Showing Dashboard');
    return <Dashboard />;
  }

  // Otherwise, show the welcome screen
  console.log('Showing Welcome screen');
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to TriCoach AI</CardTitle>
          <CardDescription>
            Let's set up your personalized training plan to reach your goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={() => {
              console.log('Get Started clicked');
              startOnboarding();
            }}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;