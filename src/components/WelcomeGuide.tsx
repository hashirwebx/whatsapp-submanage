import { useState } from 'react';
import { X, MessageSquare, CreditCard, BarChart3, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function WelcomeGuide({ isOpen, onClose, userName }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: MessageSquare,
      title: 'Welcome to SubTrack Pro!',
      description: `Hi ${userName}! Let's take a quick tour of your new subscription management assistant.`,
      color: 'text-green-600',
    },
    {
      icon: CreditCard,
      title: 'Track Your Subscriptions',
      description: 'Add all your subscriptions in one place. We support multiple currencies and billing cycles.',
      color: 'text-blue-600',
    },
    {
      icon: BarChart3,
      title: 'AI-Powered Insights',
      description: 'Get smart recommendations to save money, detect duplicates, and optimize your spending.',
      color: 'text-purple-600',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Chat Assistant',
      description: 'Manage everything through natural conversations. Ask questions, add subscriptions, or get reminders.',
      color: 'text-green-600',
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share subscriptions with family members and split costs automatically.',
      color: 'text-orange-600',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Getting Started</DialogTitle>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
          <DialogDescription>
            Take a quick tour of SubTrack Pro features
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 ${step.color}`}>
              <Icon size={40} />
            </div>
            <h3 className="text-2xl mb-3">{step.title}</h3>
            <p className="text-gray-600 mb-6">{step.description}</p>
            
            {/* Progress dots */}
            <div className="flex gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep ? 'bg-green-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
            {currentStep === steps.length - 1 ? "Let's Go!" : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
