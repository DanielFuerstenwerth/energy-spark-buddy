interface SandraAvatarProps {
  width?: number;
  height?: number;
  className?: string;
}

const SandraAvatar = ({ width = 48, height = 48, className = "" }: SandraAvatarProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" opacity="0.1" />
      
      {/* Face */}
      <circle cx="50" cy="45" r="28" fill="hsl(25, 70%, 75%)" />
      
      {/* Hair */}
      <path
        d="M 22 35 Q 22 15 50 15 Q 78 15 78 35 Q 78 42 72 48 L 72 35 Q 72 20 50 20 Q 28 20 28 35 L 28 48 Q 22 42 22 35 Z"
        fill="hsl(25, 40%, 25%)"
      />
      
      {/* Left eye */}
      <circle cx="40" cy="42" r="3" fill="hsl(25, 20%, 20%)" />
      
      {/* Right eye */}
      <circle cx="60" cy="42" r="3" fill="hsl(25, 20%, 20%)" />
      
      {/* Smile */}
      <path
        d="M 38 52 Q 50 58 62 52"
        stroke="hsl(25, 40%, 50%)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Rosy cheeks */}
      <circle cx="35" cy="50" r="4" fill="hsl(0, 70%, 70%)" opacity="0.4" />
      <circle cx="65" cy="50" r="4" fill="hsl(0, 70%, 70%)" opacity="0.4" />
      
      {/* Neck/Shoulders */}
      <path
        d="M 35 70 Q 50 80 65 70"
        stroke="hsl(25, 70%, 75%)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Top (clothing) */}
      <rect x="30" y="75" width="40" height="20" rx="3" fill="hsl(var(--primary))" opacity="0.8" />
    </svg>
  );
};

export default SandraAvatar;
