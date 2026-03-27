import { Skeleton } from './skeleton';

interface TableSkeletonProps {
  rows?:    number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`head-${i}`} className="flex-1">
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
      
      {/* Body */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`row-${i}`} className="px-4 py-4 flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={`cell-${j}`} className="flex-1">
                <Skeleton className="h-5 w-[85%] rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
