import Link from 'next/link';
import { Compass, Home, User, Rocket, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavLink } from './NavLink';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navLinks = (
    <>
      <NavLink href="/">
        <Home />
        Dashboard
      </NavLink>
      <NavLink href="/onboarding">
        <Rocket />
        Onboarding
      </NavLink>
      <NavLink href="/profile">
        <User />
        Profile
      </NavLink>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-headline font-semibold">
              <Compass className="h-6 w-6 text-primary" />
              <span>Project Compass</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Link href="/login">
              <Button size="sm" className="w-full">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Compass className="h-6 w-6 text-primary" />
                    <span className="sr-only">Project Compass</span>
                    <span className="font-headline">Project Compass</span>
                  </Link>
                  {navLinks}
                </nav>
                <div className="mt-auto">
                    <Link href="/login">
                      <Button size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
