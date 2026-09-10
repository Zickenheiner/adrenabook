import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Separator } from '@/core/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/core/components/ui/tabs';
import routes from '@/core/constants/routes';
import { useActivityDetail } from '../../domain/hooks/activity-detail.hook';
import ActivityHeader from '../components/ActivityHeader';
import ActivityGallery from '../components/ActivityGallery';
import ActivityPrerequisites from '../components/ActivityPrerequisites';
import ActivityEquipment from '../components/ActivityEquipment';
import ActivitySlots from '../components/ActivitySlots';
import ActivityReviews from '../components/ActivityReviews';

function ActivityDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl">
      <Skeleton className="h-5 w-24" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-video rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-28 mt-4" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

function ActivityDetailError() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-lg font-semibold">Activité introuvable</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Cette activité n'existe pas ou a été désactivée.
      </p>
      <Button variant="outline" onClick={() => navigate(routes.activitySearch)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la recherche
      </Button>
    </div>
  );
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activity, activityIsLoading, activityError } = useActivityDetail(
    id ?? '',
  );

  if (activityIsLoading) return <ActivityDetailSkeleton />;
  if (activityError || !activity) return <ActivityDetailError />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl"
    >
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Retour
      </Button>

      {/* Hero: gallery + header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ActivityGallery photos={activity.photos} videos={activity.videos} />
        <div className="flex flex-col justify-center">
          <ActivityHeader activity={activity} />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tabs: description, prérequis & équipement, créneaux, avis */}
      <Tabs defaultValue="description" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="prerequisites">Prérequis</TabsTrigger>
          <TabsTrigger value="slots">Créneaux</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="prerequisites" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <ActivityPrerequisites prerequisites={activity.prerequisites} />
            <ActivityEquipment equipment={activity.includedEquipment} />
          </motion.div>
        </TabsContent>

        <TabsContent value="slots">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ActivitySlots slots={activity.upcomingSlots} />
          </motion.div>
        </TabsContent>

        <TabsContent value="reviews">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ActivityReviews reviewsSummary={activity.reviewsSummary} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
