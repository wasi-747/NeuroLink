import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'px-4 py-3 shadow-lg rounded-xl',
          duration: 4000,
        }}
      />
    </div>
  );
};

export default Layout;
