
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, ShieldCheck, Server, LockClosed, Bell, ChevronDown } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
      
      {/* Left: System Status (Admin Only) */}
      <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-gray-700">
              <Server className="w-4 h-4 text-green-500"/>
              <span className="text-[10px] text-gray-400 font-mono">SYSTEM: <span className="text-green-400">ONLINE</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-gray-700">
              <LockClosed className="w-4 h-4 text-brand-primary"/>
              <span className="text-[10px] text-gray-400 font-mono">SECURE MODE</span>
          </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Admin Notification */}
        <div className="relative cursor-pointer group">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Admin Profile */}
        <div className="relative">
            <button 
                className="flex items-center gap-3 focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="text-right hidden sm:block">
                    <p className="text-white font-bold text-sm">{user?.displayName || 'Admin'}</p>
                    <p className="text-xs text-brand-primary font-mono uppercase tracking-wider">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
                    <ShieldCheck className="w-6 h-6 text-white"/>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500"/>
            </button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                        <div className="p-3 border-b border-gray-700">
                            <p className="text-xs text-gray-400">Logado como</p>
                            <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                            <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg flex items-center gap-2">
                                <LogOut className="w-4 h-4"/> Sair do Painel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
