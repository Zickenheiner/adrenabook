import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/core/components/ui/card';
import { Mountain } from 'lucide-react';
import routes from '@/core/constants/routes';
import ProfessionalRegistrationSuccess from '../components/ProfessionalRegistrationSuccess';

export default function ProfessionalRegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    centerId?: string;
    estimatedReviewTime?: string;
  } | null;

  const centerId = state?.centerId ?? '—';
  const estimatedReviewTime = state?.estimatedReviewTime ?? '48h ouvrées';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mountain className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">AdrenaBook</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ProfessionalRegistrationSuccess
              centerId={centerId}
              estimatedReviewTime={estimatedReviewTime}
              onGoHome={() => navigate(routes.home)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
