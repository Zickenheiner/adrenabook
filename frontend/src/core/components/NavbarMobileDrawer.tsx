import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Heart, Bell, ShieldCheck, LogOut } from 'lucide-react';

import { cn } from '@/core/utils/cn';
import routes from '@/core/constants/routes';
import { Button } from '@/core/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/core/components/ui/sheet';
import { Separator } from '@/core/components/ui/separator';

interface NavLink {
  label: string;
  to: string;
  icon: React.ElementType;
}

interface Props {
  navLinks: NavLink[];
  onLogout: () => void;
}

const profileLinks = [
  { label: 'Profil santé', to: routes.healthProfile, icon: Heart },
  { label: 'Notifications', to: routes.notificationPreferences, icon: Bell },
  { label: 'Mes droits RGPD', to: routes.rgpdProfile, icon: ShieldCheck },
];

export default function NavbarMobileDrawer({ navLinks, onLogout }: Props) {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle asChild>
            <Link
              to={routes.home}
              onClick={handleClose}
              className="flex items-center gap-2 font-display text-xl font-bold text-primary"
            >
              <span className="text-2xl">⚡</span>
              AdrenaBook
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navigation principal
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <nav className="flex flex-col gap-1 p-4">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
          {navLinks.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === routes.home}
              onClick={handleClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="flex flex-col gap-1 p-4">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mon compte
          </p>
          {profileLinks.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={handleClose}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <Separator className="my-2" />

          <button
            onClick={() => {
              handleClose();
              onLogout();
            }}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 w-full text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Se déconnecter
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
