// ledgerlens-frontend/src/pages/users/UsersPage.tsx
import { useState } from 'react';
import { Plus, Search, Users, Shield, UserCheck, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { cn } from '@/lib/utils';
import { useUserList, useUpdateUserStatus } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';

import { UserRow } from './UserRow';
import { UserCard } from './UserCard';
import { InviteUserModal } from './InviteUserModal';
import { UserPermissionsModal } from './UserPermissionsModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import { UserDetailItem } from '@/types/user.types';

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState<{ id: string; name: string } | null>(null);
  const [roleUser, setRoleUser] = useState<UserDetailItem | null>(null);
  const [statusAction, setStatusAction] = useState<{ id: string; isActive: boolean } | null>(null);

  // Queries
  const { data, isLoading } = useUserList({ search: searchTerm, page, limit: 10 });
  const users = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const statusMut = useUpdateUserStatus();
 
  const handleToggleStatus = async () => {
    if (statusAction) {
      await statusMut.mutateAsync(statusAction);
      setStatusAction(null);
    }
  };

  // Basic permission check - normally this would be more granular
  // but for now let's assume if they can see the page they have basic access
  // and we'll restrict actions inside.

  // Calculate some simple stats for the header
  const adminCount = users.filter(u => u.role.name === 'ADMIN').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Users & Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's members and their access levels.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-brand-50/30 border-brand-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-900">{meta.total}</div>
              <div className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Total Members</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/30 border-green-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{activeCount}</div>
              <div className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Active Now</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/30 border-slate-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{adminCount}</div>
              <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Administrators</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border shadow-sm gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9 bg-slate-50 border-0 focus-visible:ring-brand-500" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-end sm:self-auto">
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded-md transition-all", 
              viewMode === 'list' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded-md transition-all", 
              viewMode === 'grid' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* User Content */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : users.length === 0 ? (
        <EmptyState 
          icon={Users} 
          title="No teammates found" 
          description={searchTerm ? "Try a different search term." : "Start by inviting your first team member."} 
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role / Assigned Clients</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <UserRow 
                      key={u.id} 
                      user={u} 
                      currentUserEmail={currentUser?.email}
                      onViewPermissions={() => setPermissionUserId({ id: u.id, name: u.fullName })}
                      onChangeRole={() => setRoleUser(u)}
                      onToggleStatus={(isActive) => setStatusAction({ id: u.id, isActive })}
                      isAdmin={isAdmin}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <UserCard 
                  key={u.id} 
                  user={u} 
                  currentUserEmail={currentUser?.email}
                  onViewPermissions={() => setPermissionUserId({ id: u.id, name: u.fullName })}
                  onChangeRole={() => setRoleUser(u)}
                  onToggleStatus={(isActive) => setStatusAction({ id: u.id, isActive })}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
          
          <Pagination 
            page={page} 
            totalPages={meta.totalPages} 
            onPageChange={setPage} 
          />
        </>
      )}

      {/* Modals */}
      <InviteUserModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
        onSuccess={() => setInviteModalOpen(false)}
      />

      <UserPermissionsModal 
        open={!!permissionUserId}
        onOpenChange={(open) => !open && setPermissionUserId(null)}
        userId={permissionUserId?.id || null}
        userName={permissionUserId?.name}
      />

      <ChangeRoleModal 
        open={!!roleUser}
        onOpenChange={(open) => !open && setRoleUser(null)}
        user={roleUser}
        onSuccess={() => setRoleUser(null)}
      />

      <ConfirmDialog 
        open={!!statusAction}
        onOpenChange={(open) => !open && setStatusAction(null)}
        title={statusAction?.isActive ? "Activate User" : "Deactivate User"}
        description={statusAction?.isActive 
          ? "Are you sure you want to reactivate this user? They will regain access to the organization."
          : "Are you sure you want to deactivate this user? They will no longer be able to log in or access organization data."}
        variant={statusAction?.isActive ? "default" : "destructive"}
        isPending={statusMut.isPending}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}
