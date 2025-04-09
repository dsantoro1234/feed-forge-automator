
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Settings, Database, FileCode, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <FileCode className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Feed Forge</span>
        </div>
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/templates" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Templates</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
