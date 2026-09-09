import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Heart,
  Bell,
  ShieldCheck,
  Map,
  Search,
  Home,
  Briefcase,
  ShieldAlert,
  CalendarClock,
  FileSpreadsheet,
  Upload,
  Users,
  ClipboardList,
  BadgeCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/core/utils/cn';
import { clearTokens } from '@/core/local/storage';
import { getSessionUser, getUserInitial } from '@/core/utils/session';
import routes from '@/core/constants/routes';

import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';
import NavbarMobileDrawer from './NavbarMobileDrawer';

const navLinks = [
  { label: 'Accueil', to: routes.home, icon: Home },
  { label: 'Rechercher', to: routes.activitySearch, icon: Search },
  { label: 'Carte', to: routes.centerMap, icon: Map },
];

/**
 * Entrees de navigation propres a chaque role.
 *
 * Elles ne constituent pas un controle d'acces : l'autorisation est appliquee
 * par l'API. Il s'agit uniquement de rendre atteignables des espaces qui,
 * sinon, ne le sont qu'en saisissant l'URL a la main.
 */
const proLinks = [
  { label: 'Tableau de bord', to: routes.proDashboard, icon: Briefcase },
  { label: 'Mes activités', to: routes.proActivityList, icon: CalendarClock },
  { label: 'Import CSV', to: routes.proCsvImport, icon: Upload },
  {
    label: 'Export comptable',
    to: routes.proAccountingExport,
    icon: FileSpreadsheet,
  },
];

const adminLinks = [
  { label: 'Utilisateurs', to: routes.adminUserList, icon: Users },
  { label: 'Validation KYC', to: routes.adminCenterList, icon: BadgeCheck },
  { label: "Journal d'audit", to: routes.adminAuditLogs, icon: ClipboardList },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const roleLinks =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'professionnel'
        ? proLinks
        : [];
  const roleLabel = user?.role === 'admin' ? 'Administration' : 'Espace pro';
  const RoleIcon = user?.role === 'admin' ? ShieldAlert : Briefcase;

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login, { replace: true });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={routes.home}
          className="flex items-center gap-2 font-display text-xl font-bold text-primary select-none"
        >
          <span className="text-2xl">⚡</span>
          AdrenaBook
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === routes.home}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}

          {roleLinks.length > 0 && (
            <NavLink
              to={roleLinks[0].to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <RoleIcon className="h-4 w-4" />
              {roleLabel}
            </NavLink>
          )}
        </nav>

        {/* Desktop profile dropdown */}
        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Menu profil"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getUserInitial(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link
                  to={routes.healthProfile}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="h-4 w-4" />
                  Profil santé
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={routes.notificationPreferences}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={routes.rgpdProfile}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Mes droits RGPD
                </Link>
              </DropdownMenuItem>
              {roleLinks.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {roleLabel}
                  </DropdownMenuLabel>
                  {roleLinks.map(({ label, to, icon: Icon }) => (
                    <DropdownMenuItem key={to} asChild>
                      <Link
                        to={to}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <NavbarMobileDrawer
            onLogout={handleLogout}
            navLinks={navLinks}
            roleLinks={roleLinks}
            roleLabel={roleLabel}
          />
        </div>
      </div>
    </motion.header>
  );
}

export type {};
export { navLinks };
