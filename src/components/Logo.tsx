import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center shadow-glow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>
      <span className={cn('font-bold tracking-tight', sizeClasses[size])}>
        <span className="text-foreground">Bora</span>
        <span className="text-gradient">Jogar</span>
      </span>
    </div>
  );
}
