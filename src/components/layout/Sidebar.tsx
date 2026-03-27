import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  X, 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Building2, 
  Users, 
  Building, 
  CreditCard,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, hasPermission } = useAuthStore();
  const logoutMutation = useLogout();

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',    icon: LayoutDashboard, permission: null },
    { name: 'Documents',   path: '/documents',    icon: FileText,        permission: null },
    { name: 'Invoices',    path: '/invoices',     icon: Receipt,         permission: null },
    { name: 'Clients',     path: '/clients',      icon: Building2,       permission: null },
    { name: 'Team',        path: '/users',        icon: Users,           permission: 'MANAGE_USERS' },
    { type: 'separator' },
    { name: 'Organization',path: '/organization', icon: Building,        permission: null },
    { name: 'Subscription',path: '/subscription', icon: CreditCard,      permission: 'MANAGE_BILLING' },
  ];

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col",
          "border-r bg-white transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-navy-900">LedgerLens</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-hide">
          {navItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="my-4 border-t border-gray-100" />;
            }
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            const Icon = item.icon!;
            const isActive = location.pathname.startsWith(item.path!);

            return (
              <Link
                key={item.path}
                to={item.path!}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-brand-50 text-brand-600 border-r-2 border-brand-500" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 truncate" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar size="sm">
                <AvatarFallback className="bg-brand-100 text-brand-700">
                  {getInitials(user?.fullName || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="truncate text-sm font-medium text-navy-900">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role?.name || ''}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleLogout}
              loading={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
