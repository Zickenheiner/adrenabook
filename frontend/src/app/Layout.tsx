import { Outlet } from 'react-router-dom';
import Navbar from '@/core/components/Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      {/*
        Lien d'évitement (RGAA 12.7) : premier élément focusable de la page,
        il permet d'atteindre le contenu sans retraverser la navigation à
        chaque écran. Masqué visuellement tant qu'il n'a pas le focus — le
        cacher avec `hidden` le retirerait aussi du parcours clavier.
      */}
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="contenu-principal" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
