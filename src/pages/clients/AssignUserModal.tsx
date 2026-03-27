import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserList, useAssignUser, useRemoveUser, useClient } from '@/hooks/useClients';

interface AssignUserModalProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignUserModal({ clientId, open, onOpenChange }: AssignUserModalProps) {
  const [search, setSearch] = useState('');
  
  const { data: users, isLoading: isLoadingUsers } = useUserList();
  const { data: client } = useClient(clientId);
  
  const assignMut = useAssignUser();
  const removeMut = useRemoveUser();

  const assignedUserIds = new Set(client?.assignedUsers?.map(u => u.id) || []);

  const filteredUsers = (users || []).filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (userId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removeMut.mutateAsync({ clientId, userId });
      } else {
        await assignMut.mutateAsync({ clientId, userId });
      }
    } catch (e) {
      // Errors handled by hook toasts
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
          <DialogDescription>
            Select team members who should have access to this client.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No users found matching "{search}"
            </div>
          ) : (
            filteredUsers.map(user => {
              const isAssigned = assignedUserIds.has(user.id);
              const isProcessing = assignMut.isPending || removeMut.isPending;

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isAssigned ? 'border-brand-200 bg-brand-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      disabled={isProcessing}
                      onChange={() => handleToggle(user.id, isAssigned)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                    />
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email} • {typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
                      </p>
                    </div>
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
