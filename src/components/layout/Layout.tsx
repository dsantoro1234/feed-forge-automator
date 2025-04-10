
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from "@/components/ui/sonner";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow ml-16 md:ml-56 pt-6 px-4 md:px-8">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 ml-16 md:ml-56">
        <div className="container mx-auto text-center text-sm text-gray-500">
          Feed Forge Automator &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
