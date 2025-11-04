interface LogoRZDProps {
  size?: number;
  className?: string;
}

const LogoRZD = ({ size = 80, className = "" }: LogoRZDProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo externo */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#333"
        strokeWidth="8"
        fill="none"
        opacity="0.9"
      />
      
      {/* Círculo interno gradiente */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="url(#gradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* Braço do cavaquinho */}
      <rect
        x="42"
        y="25"
        width="8"
        height="35"
        fill="#555"
        rx="1"
      />
      
      {/* Corpo do cavaquinho */}
      <path
        d="M 35 58 Q 35 70 46 72 Q 57 70 57 58 L 57 55 L 35 55 Z"
        fill="#666"
      />
      
      {/* Cordas (4 cordas) */}
      <line x1="43" y1="28" x2="40" y2="60" stroke="#C82333" strokeWidth="0.5" />
      <line x1="45" y1="28" x2="43" y2="60" stroke="#C82333" strokeWidth="0.5" />
      <line x1="47" y1="28" x2="49" y2="60" stroke="#C82333" strokeWidth="0.5" />
      <line x1="49" y1="28" x2="52" y2="60" stroke="#C82333" strokeWidth="0.5" />
      
      {/* Tarrachas (4 - 2 de cada lado) */}
      <circle cx="40" cy="26" r="2" fill="#333" />
      <circle cx="43" cy="24" r="2" fill="#333" />
      <circle cx="47" cy="24" r="2" fill="#333" />
      <circle cx="50" cy="26" r="2" fill="#333" />
      
      {/* Pestana */}
      <rect x="41" y="29" width="10" height="1.5" fill="#222" />
      
      {/* Boca do cavaquinho */}
      <circle cx="46" cy="62" r="4" fill="#1a1a1a" />
      
      {/* Gradiente para o círculo */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#888" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#333" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LogoRZD;
