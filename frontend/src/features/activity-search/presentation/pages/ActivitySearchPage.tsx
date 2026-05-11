import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Inbox, Search } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { useActivitySearch } from '../../domain/hooks/activity-search.hook';
import type { ActivitySearchParamsEntity } from '../../domain/entities/activity-search.entity';
import type { ActivitySearchFormData } from '../../domain/schemas/activity-search.schema';
import ActivitySearchFilters from '../components/ActivitySearchFilters';
import {
  ActivityCardMotion,
  ActivityCardSkeleton,
} from '../components/ActivityCard';
import ActivitySearchPagination from '../components/ActivitySearchPagination';

const DEFAULT_PARAMS: ActivitySearchParamsEntity = {
  page: 1,
  pageSize: 20,
  sortBy: 'relevance',
};

function ActivitySearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ActivitySearchError() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">
        Une erreur est survenue lors de la recherche.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}

function ActivitySearchEmpty({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh]">
      <Inbox className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="font-medium text-foreground">Aucune activité trouvée</p>
        <p className="text-sm text-muted-foreground mt-1">
          {query
            ? `Aucun résultat pour « ${query} ». Essayez d'élargir vos critères.`
            : 'Essayez de modifier vos filtres pour trouver des activités.'}
        </p>
      </div>
    </div>
  );
}

export default function ActivitySearchPage() {
  const [params, setParams] =
    useState<ActivitySearchParamsEntity>(DEFAULT_PARAMS);
  const [queryInput, setQueryInput] = useState('');

  const { searchResult, searchIsLoading, searchError } =
    useActivitySearch(params);

  const handleSearch = (data: ActivitySearchFormData) => {
    setParams({
      ...data,
      query: queryInput || data.query,
      page: 1,
      pageSize: 20,
    });
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams((prev) => ({ ...prev, query: queryInput, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = searchResult
    ? Math.ceil(searchResult.total / (searchResult.pageSize || 20))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / barre de recherche */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50 py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center space-y-4"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Trouvez votre prochaine aventure
          </h1>
          <p className="text-muted-foreground">
            Recherchez parmi des centaines d'activités sportives près de chez
            vous.
          </p>
          <form onSubmit={handleTextSearch} className="flex gap-2">
            <Input
              placeholder="Escalade, parapente, plongée…"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 h-11 text-base"
            />
            <Button type="submit" size="lg" className="shrink-0">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtres */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-6 bg-card border border-border/50 rounded-xl p-5 shadow-sm">
              <ActivitySearchFilters
                defaultValues={params}
                onSearch={handleSearch}
              />
            </div>
          </aside>

          {/* Résultats */}
          <main className="flex-1 space-y-6">
            {/* Compteur de résultats */}
            {searchResult && !searchIsLoading && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {searchResult.total === 0
                    ? 'Aucun résultat'
                    : `${searchResult.total} activité${searchResult.total > 1 ? 's' : ''} trouvée${searchResult.total > 1 ? 's' : ''}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Page {searchResult.page} / {totalPages}
                </p>
              </div>
            )}

            {/* États */}
            {searchIsLoading && <ActivitySearchSkeleton />}

            {searchError && !searchIsLoading && <ActivitySearchError />}

            {!searchIsLoading &&
              !searchError &&
              searchResult?.items.length === 0 && (
                <ActivitySearchEmpty query={params.query} />
              )}

            {!searchIsLoading &&
              !searchError &&
              searchResult &&
              searchResult.items.length > 0 && (
                <>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {searchResult.items.map((activity, index) => (
                      <ActivityCardMotion
                        key={activity.id}
                        activity={activity}
                        index={index}
                      />
                    ))}
                  </motion.div>

                  <ActivitySearchPagination
                    page={searchResult.page}
                    pageSize={searchResult.pageSize}
                    total={searchResult.total}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
