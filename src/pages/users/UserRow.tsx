// ledgerlens-frontend/src/pages/users/UserRow.tsx
import { UserDetailItem } from '@/types/user.types';
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

interface UserRowProps {
  user: UserDetailItem;
  currentUserEmail?: string;
  onViewPermissions: () => void;
  onChangeRole: () => void;
  onToggleStatus: (isActive: boolean) => void;
  isAdmin?: boolean;
}

export function UserRow({ 
  user, 
  currentUserEmail, 
  onViewPermissions, 
  onChangeRole, 
  onToggleStatus,
  isAdmin = false
}: UserRowProps) {
  const isSelf = user.email === currentUserEmail;

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs ring-1 ring-brand-100">
            {getInitials(user.fullName)}
          </div>
          <div>
            <div className="font-semibold text-navy-900 flex items-center gap-1.5">
              {user.fullName}
              {isSelf && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0 rounded-full font-bold uppercase">You</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 font-medium text-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm font-semibold">{user.role.name}</span>
        </div>
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
      </td>
      <td className="py-4 px-4">
        {user.isActive ? (
          <Badge variant="success" className="gap-1 px-1.5 py-0">
            <UserCheck className="h-3 w-3" /> Active
          </Badge>
        ) : (
          <Badge variant="ghost" className="gap-1 px-1.5 py-0 bg-gray-100 text-gray-400">
            <UserX className="h-3 w-3" /> Inactive
          </Badge>
        )}
      </td>
      <td className="py-4 px-4 text-xs text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>
      <td className="py-4 px-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </td>
    </tr>
  );
}
