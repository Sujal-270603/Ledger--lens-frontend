import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserPermissions } from '@/hooks/useUsers';
import { ShieldCheck, FileText, Users, Calculator, Settings } from 'lucide-react';

interface UserPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
}

export function UserPermissionsModal({ open, onOpenChange, userId, userName }: UserPermissionsModalProps) {
  const { data: permissions, isLoading } = useUserPermissions(userId || '');

  const groups = [
    { name: 'Invoices',  icon: FileText,   pattern: 'INVOICE' },
    { name: 'Documents', icon: ShieldCheck, pattern: 'DOCUMENT' },
    { name: 'Clients',   icon: Users,       pattern: 'CLIENT' },
    { name: 'Ledger',    icon: Calculator,  pattern: 'LEDGER|JOURNAL' },
    { name: 'Users',     icon: Settings,    pattern: 'USER|ROLE|ORGANIZATION' },
  ];

  const getGroupPermissions = (pattern: string) => {
    const regex = new RegExp(pattern);
    return (permissions || []).filter(p => regex.test(p));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Permissions</DialogTitle>
          <DialogDescription>
            Detailed access list for {userName || 'this user'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            groups.map((group) => {
              const groupPerms = getGroupPermissions(group.pattern);
              if (groupPerms.length === 0) return null;

              return (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-navy-900 border-b pb-1.5">
                    <group.icon className="h-4 w-4 text-slate-400" />
                    {group.name}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {groupPerms.map(p => (
                      <Badge key={p} className="bg-slate-50 text-slate-600 border-slate-200 font-medium px-2 py-0.5">
                        {p.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
