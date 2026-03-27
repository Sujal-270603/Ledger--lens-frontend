import { Mail, Phone, Pencil, Trash2, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ClientListItem } from '@/types/client.types';
import { useAuth } from '@/hooks/useAuth';

interface ClientCardProps {
  client: ClientListItem;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function ClientCard({ client, onEdit, onDelete, onClick }: ClientCardProps) {
  const { isAdmin } = useAuth();

  return (
    <Card 
      className="cursor-pointer hover:border-brand-300 transition-colors group relative overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg shrink-0 group-hover:bg-brand-100 transition-colors">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                  {client.name}
                </h3>
                {client.gstin && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-gray-50 text-gray-600 font-mono tracking-wider shrink-0">
                    GST
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 mt-3">
                {client.email ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5 mr-2 shrink-0 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-400 italic">
                    <Mail className="h-3.5 w-3.5 mr-2 shrink-0 opacity-50" />
                    No email provided
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-3.5 w-3.5 mr-2 shrink-0 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  <Receipt className="h-3.5 w-3.5 mr-2 shrink-0 text-gray-400" />
                  <span>{client._count.invoices} Invoices</span>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
