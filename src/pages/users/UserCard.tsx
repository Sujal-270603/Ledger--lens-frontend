// ledgerlens-frontend/src/pages/users/UserCard.tsx
import { UserDetailItem } from '@/types/user.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, getInitials, formatDate } from '@/lib/utils';
import { Shield, MoreVertical, ShieldAlert, UserX, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserCardProps {
  user: UserDetailItem;
  currentUserEmail?: string;
  onViewPermissions: () => void;
  onChangeRole: () => void;
  onToggleStatus: (isActive: boolean) => void;
  isAdmin?: boolean;
}

export function UserCard({ 
  user, 
  currentUserEmail, 
  onViewPermissions, 
  onChangeRole, 
  onToggleStatus,
  isAdmin = false
}: UserCardProps) {
  const isSelf = user.email === currentUserEmail;

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm ring-1 ring-brand-100">
              {getInitials(user.fullName)}
            </div>
            <div>
              <div className="font-semibold text-navy-900 flex items-center gap-1.5">
                {user.fullName}
                {isSelf && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0 rounded-full font-bold uppercase">You</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewPermissions} className="gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                View Permissions
              </DropdownMenuItem>
              {!isSelf && isAdmin && (
                <>
                  <DropdownMenuItem onClick={onChangeRole} className="gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleStatus(!user.isActive)} 
                    className={cn("gap-2", user.isActive ? "text-destructive focus:text-destructive" : "text-green-600 focus:text-green-600")}
                  >
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {user.isActive ? 'Deactivate User' : 'Activate User'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              {user.role.name}
            </div>
            {user.isActive ? (
              <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px]">
                <UserCheck className="h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="ghost" className="gap-1 px-1.5 py-0 text-[10px] bg-gray-100 text-gray-400">
                <UserX className="h-3 w-3" /> Inactive
              </Badge>
            )}
          </div>

          <div className="pt-3 border-t border-slate-50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Assigned Clients</div>
            <div className="flex flex-wrap gap-1">
              {user.role.name === 'ADMIN' ? (
                <Badge variant="info" className="bg-brand-50 text-brand-700 border-brand-200 text-[10px] px-1.5 py-0">Full Access</Badge>
              ) : (user.assignedClients && user.assignedClients.length > 0) ? (
                user.assignedClients.map(c => (
                  <Badge key={c.id} variant="ghost" className="text-[10px] px-1.5 py-0 bg-gray-100 border-gray-200">{c.name}</Badge>
                ))
              ) : (
                <span className="text-[10px] text-muted-foreground italic">No clients assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-[10px] text-muted-foreground text-right italic">
          Joined {formatDate(user.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}
