import { Compass, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import routes from '@/core/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <Compass className="size-10 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-6xl font-bold tracking-tight">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cette page a disparu de la carte
          </h1>
          <p className="text-muted-foreground">
            La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez
            l'adresse ou repartez à l'aventure depuis l'accueil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to={routes.home}>
              <Home className="size-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={routes.activitySearch}>
              <Search className="size-4" />
              Chercher une activité
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
