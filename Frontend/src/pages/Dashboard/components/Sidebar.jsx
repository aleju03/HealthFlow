import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Layout, Upload, LogOut, Settings, BookOpen } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Inicio', icon: Layout, path: '/dashboard' },
    { name: 'Histórico', icon: BookOpen, path: '/dashboard/historical' },
    { name: 'Importar', icon: Upload, path: '/dashboard/import' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-full w-64 flex flex-col justify-between bg-white border-r border-zinc-200 py-4">
      {/* Logo */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="h-6 w-6 flex-shrink-0 text-purple-600" />
          <span className="font-bold text-xl text-purple-600">
            HealthFlow
          </span>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActivePath(item.path) ? "secondary" : "ghost"}
              className={`w-full justify-start px-4
                ${isActivePath(item.path)
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                  : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                } h-10`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap overflow-hidden">
                {item.name}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-4 hover:bg-zinc-100"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-zinc-200 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left whitespace-nowrap overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900">{user?.username || 'Usuario'}</p>
                  <p className="text-sm text-zinc-500">{user?.email}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              className="gap-2 text-zinc-600 focus:text-zinc-900 cursor-pointer"
              onClick={() => navigate('/dashboard/profile')}
            >
              <Settings className="h-4 w-4" />
              Opciones
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export { Sidebar };