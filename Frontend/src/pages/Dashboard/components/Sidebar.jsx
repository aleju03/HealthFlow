import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Layout, Upload, ChevronLeft, ChevronRight, LogOut, Settings, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { useAuth } from '../../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { name: 'Inicio', icon: Layout, path: '/dashboard' },
    { name: 'Histórico', icon: BookOpen, path: '/dashboard/historical' },
    { name: 'Importar', icon: Upload, path: '/dashboard/import' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '4.5rem' }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div 
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col justify-between bg-white border-r border-zinc-200 py-4 relative overflow-hidden"
    >
      {/* Logo and Toggle */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ 
                scale: isCollapsed ? 0.9 : 1,
                x: isCollapsed ? -2 : 0 
              }}
            >
              <Activity className="h-6 w-6 flex-shrink-0 text-purple-600" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap"
                >
                  HealthFlow
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0 hover:bg-zinc-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4 text-zinc-600" /> : <ChevronLeft className="h-4 w-4 text-zinc-600" />}
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <TooltipProvider>
            {menuItems.map((item) => (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      variant={isActivePath(item.path) ? "secondary" : "ghost"}
                      className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} 
                        ${isActivePath(item.path)
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                          : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                        } transition-colors duration-200 h-10`}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        animate={{ 
                          scale: isActivePath(item.path) ? 1.1 : 1
                        }}
                        className="flex-shrink-0"
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 'auto' }}
                            exit={{ opacity: 0, x: -10, width: 0 }}
                            className="ml-2 whitespace-nowrap overflow-hidden"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                {isCollapsed && hoveredItem === item.name && (
                  <TooltipContent 
                    side="right" 
                    className="text-xs bg-zinc-900 text-white border-zinc-800"
                  >
                    <p>{item.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                variant="ghost"
                className={`w-full ${isCollapsed ? 'justify-center p-2' : 'justify-start p-4'} hover:bg-zinc-100`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-zinc-200 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        className="text-left whitespace-nowrap overflow-hidden"
                      >
                        <p className="text-sm font-medium text-zinc-900">{user?.username || 'Usuario'}</p>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Button>
            </motion.div>
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
    </motion.div>
  );
};

export { Sidebar };