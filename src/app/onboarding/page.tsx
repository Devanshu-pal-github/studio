import OnboardingClient from './OnboardingClient';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-4">
        <h1 className="font-headline text-3xl font-bold">Welcome to Project Compass!</h1>
        <p className="text-muted-foreground">Let's get to know you a bit. Answer a few questions to personalize your learning journey.</p>
      </div>
      <OnboardingClient />
    </div>
  );
}
