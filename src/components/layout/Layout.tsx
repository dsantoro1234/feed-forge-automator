
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container text-center text-sm text-gray-500">
          Feed Forge Automator &copy; {new Date().getFullYear()}
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
