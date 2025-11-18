import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'mini';
  className?: string;
}

const Logo = ({ variant = 'full', className = '' }: LogoProps) => {
  if (variant === 'mini') {
    return (
      <Link
        to="/"
        className={`inline-flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-black text-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25 ${className}`}
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em'
        }}
      >
        V
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 md:gap-3 group ${className}`}
    >
      <div 
        className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-black text-lg md:text-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25"
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em'
        }}
      >
        V
      </div>
      <span className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
        vnb-transparenz
      </span>
    </Link>
  );
};

export default Logo;
