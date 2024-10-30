import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;