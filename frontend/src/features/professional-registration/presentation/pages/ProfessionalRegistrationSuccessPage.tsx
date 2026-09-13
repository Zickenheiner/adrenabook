import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/core/components/ui/card';
import routes from '@/core/constants/routes';
import ProfessionalRegistrationSuccess from '../components/ProfessionalRegistrationSuccess';
import Logo from '@/core/components/Logo';

export default function ProfessionalRegistrationSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo className="h-12 w-12" />
          <span className="text-xl font-bold tracking-tight">AdrenaBook</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ProfessionalRegistrationSuccess
              onGoHome={() => navigate(routes.home)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
