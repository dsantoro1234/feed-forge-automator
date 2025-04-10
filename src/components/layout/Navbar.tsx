
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  History, 
  Settings,
  DollarSign
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const menuItems = [
    { path: '/', icon: <Home />, label: 'Home' },
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/products', icon: <ShoppingCart />, label: 'Products' },
    { path: '/templates', icon: <FileText />, label: 'Templates' },
    { path: '/history', icon: <History />, label: 'History' },
    { path: '/exchange-rates', icon: <DollarSign />, label: 'Exchange Rates' },
    { path: '/settings', icon: <Settings />, label: 'Settings' },
  ];
  
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-16 md:w-56 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 overflow-hidden z-10">
      <div className="flex justify-center md:justify-start md:pl-4 mb-8">
        <Link to="/" className="text-xl font-bold text-primary">
          <span className="hidden md:inline">FeedManager</span>
          <span className="md:hidden">FM</span>
        </Link>
      </div>
      
      <div className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm ${
              isActive(item.path)
                ? 'bg-primary/10 text-primary border-r-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-auto px-4 pb-4">
        <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">
          Version 1.0.0
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
