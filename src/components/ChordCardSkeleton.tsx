import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ChordCardSkeleton = () => (
  <Card className="p-4 bg-card">
    <div className="flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between">
        <Skeleton className="h-7 w-12" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-32 h-40 rounded-lg" />
      <Skeleton className="h-4 w-20" />
    </div>
  </Card>
);

export const ChordGridSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ChordCardSkeleton key={i} />
    ))}
  </div>
);

export default ChordCardSkeleton;
