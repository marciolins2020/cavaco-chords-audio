import React from 'react';
import { ROOT_NOTES, CHORD_TYPES } from '@/constants/chordDatabase';

interface ChordSelectorProps {
  currentRoot: string;
  currentSuffix: string;
  onSelectRoot: (root: string) => void;
  onSelectSuffix: (suffix: string) => void;
}

const formatSuffix = (type: string) => {
  switch (type) {
    case 'M': return 'Maior';
    case 'm': return 'menor';
    case 'm7b5': return 'm7(b5)';
    case '5+': return '(#5)';
    case 'dim': return 'dim';
    default: return type;
  }
};

const InstrumentSelector: React.FC<ChordSelectorProps> = ({ 
  currentRoot, 
  currentSuffix, 
  onSelectRoot, 
  onSelectSuffix 
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="bg-background rounded-xl shadow-sm p-2 border border-border">
         <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
            {ROOT_NOTES.map(root => (
                <button
                    key={root} 
                    onClick={() => onSelectRoot(root)}
                    className={`min-w-[40px] h-[40px] flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                      currentRoot === root 
                        ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {root}
                </button>
            ))}
         </div>
      </div>

      <div className="bg-background rounded-xl shadow-sm p-3 border border-border">
        <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">
          Variações
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CHORD_TYPES.map(type => (
                <button
                    key={type} 
                    onClick={() => onSelectSuffix(type)}
                    className={`py-2 px-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      currentSuffix === type 
                        ? 'bg-primary text-primary-foreground font-bold' 
                        : 'text-foreground border border-border hover:border-primary hover:text-primary'
                    }`}
                >
                  {formatSuffix(type)}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default InstrumentSelector;
