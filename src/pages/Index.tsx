import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Dashboard } from '@/pages/Dashboard';

const Index = () => {
  const { isComplete } = useOnboarding();

  if (!isComplete) {
    return <OnboardingWizard />;
  }

  return <Dashboard />;
};

export default Index;
