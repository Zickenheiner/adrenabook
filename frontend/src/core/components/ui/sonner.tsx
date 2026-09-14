import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      richColors
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          // richColors colore texte et bordure par type. Le fond reste neutre :
          // les teintes pleines de sonner ecrasent la charte du projet.
          '--success-bg': 'var(--popover)',
          '--success-text': 'var(--success-strong)',
          '--success-border': 'var(--success-strong)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--destructive-strong)',
          '--error-border': 'var(--destructive-strong)',
          '--warning-bg': 'var(--popover)',
          '--warning-text': 'var(--warning-strong)',
          '--warning-border': 'var(--warning-strong)',
          '--info-bg': 'var(--popover)',
          '--info-text': 'var(--info-strong)',
          '--info-border': 'var(--info-strong)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
