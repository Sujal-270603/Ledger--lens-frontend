import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center space-x-1">
          {generatePages().map((p, i) => {
            if (p === 'ellipsis') {
              return (
                <div key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }
            return (
              <Button
                key={`page-${p}`}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "h-8 w-8 p-0",
                  page !== p && "text-muted-foreground border-transparent hover:bg-slate-100"
                )}
              >
                {p}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
