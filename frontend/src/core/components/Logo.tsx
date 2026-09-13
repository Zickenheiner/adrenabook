import { cn } from '@/core/utils/cn';

interface Props {
  className?: string;
  alt?: string;
}

export default function Logo({ className, alt = '' }: Props) {
  return (
    <img
      src="/icons/logo.png"
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      className={cn('object-contain', className)}
    />
  );
}
