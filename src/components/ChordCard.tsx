import { Link } from "react-router-dom";
import { ChordEntry } from "@/types/chords";
import { Card } from "@/components/ui/card";
import ChordDiagram from "./ChordDiagram";

type Props = {
  chord: ChordEntry;
};

const ChordCard: React.FC<Props> = ({ chord }) => {
  const mainVariation = chord.variations[0];
  
  return (
    <Link to={`/chord/${chord.id}`}>
      <Card className="p-4 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-glow)] cursor-pointer group bg-card">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
              {chord.root}
            </h3>
            {chord.quality && (
              <span className="text-lg text-muted-foreground">{chord.quality}</span>
            )}
          </div>
          
          <div className="w-32 opacity-80 group-hover:opacity-100 transition-opacity">
            <ChordDiagram
              frets={mainVariation.frets}
              fingers={mainVariation.fingers}
              barre={mainVariation.barre}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            {chord.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ChordCard;
