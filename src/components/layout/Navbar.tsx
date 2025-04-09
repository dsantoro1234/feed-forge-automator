
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileJson, 
  Settings, 
  History as HistoryIcon,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const location = useLocation();
  const isMobile = useMobile();
  
  const links = [
    { to: '/', icon: <Home className="h-4 w-4" />, label: 'Dashboard' },
    { to: '/templates', icon: <FileJson className="h-4 w-4" />, label: 'Templates' },
    { to: '/products', icon: <Database className="h-4 w-4" />, label: 'Products' },
    { to: '/history', icon: <HistoryIcon className="h-4 w-4" />, label: 'History' },
    { to: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' }
  ];
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex gap-2 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/placeholder.svg" 
              alt="logo" 
              className="h-6 w-6" 
            />
            <span className="font-bold text-lg">Feed Forge</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
          {links.map(({ to, icon, label }) => (
            <Button
              key={to}
              asChild
              variant={isActive(to) ? "default" : "ghost"}
              size={isMobile ? "icon" : "default"}
              className={cn(
                isMobile ? "px-0" : "",
                isActive(to) ? "" : "text-muted-foreground"
              )}
            >
              <Link to={to}>
                {icon}
                {!isMobile && <span className="ml-2">{label}</span>}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
