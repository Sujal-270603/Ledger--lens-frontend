import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: overview } = useDashboardOverview();

  // Create a dynamic title based on the route
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const notificationCount = overview?.invoices?.pending || 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-navy-900">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="z-50 min-w-[300px] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80" 
              align="end"
              sideOffset={8}
            >
              <div className="p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="p-2">
                {notificationCount > 0 ? (
                  <Link to="/invoices?status=SUBMITTED" className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pending Approvals</p>
                      <p className="text-xs text-muted-foreground">You have {notificationCount} invoices awaiting approval.</p>
                    </div>
                  </Link>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-transparent p-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1">
              <Avatar size="sm">
                <AvatarFallback className="bg-navy-100 text-navy-700">
                  {user?.fullName ? getInitials(user.fullName) : 'UD'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start px-1 text-left">
                <span className="text-sm font-medium text-navy-900 leading-tight">
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {user?.role?.name || ''}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80" 
              align="end"
              sideOffset={8}
            >
              <div className="px-2 py-1.5 text-sm font-semibold truncate flex flex-col">
                <span>{user?.fullName}</span>
                <span className="font-normal text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
              <div className="h-px bg-gray-100 my-1"/>
              <DropdownMenu.Item asChild className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Link to="/organization">Profile Settings</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Link to="#">Change Password</Link>
              </DropdownMenu.Item>
              <div className="h-px bg-gray-100 my-1"/>
              <DropdownMenu.Item 
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
