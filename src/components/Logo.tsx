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
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xl transition-transform hover:scale-105 ${className}`}
      >
        v
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 group ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center transition-transform group-hover:scale-105">
        v
      </div>
      <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
        vnb-transparenz
      </span>
    </Link>
  );
};

export default Logo;
