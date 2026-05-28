import React from 'react';
import { motion } from 'framer-motion';
import { 
  Map, 
  AlertTriangle, 
  Activity, 
  Navigation, 
  ShieldAlert, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'map', icon: Map, label: 'Geo Dashboard' },
    { id: 'analytics', icon: Activity, label: 'AI Analytics' },
    { id: 'emergency', icon: AlertTriangle, label: 'Emergency Net' },
    { id: 'route', icon: Navigation, label: 'Safe Routes' },
    { id: 'reports', icon: ShieldAlert, label: 'Live Reports' },
  ];

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen glass-panel flex flex-col z-50 fixed left-0 top-0 border-r border-slate-700/50"
    >
      <div className="p-6 border-b border-slate-700/50 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-neon-blue shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center">
          <ShieldAlert size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-neon-blue to-neon-green">
          RakshakPath
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-800/80 text-neon-blue shadow-[0_0_10px_rgba(56,189,248,0.2)] border border-neon-blue/30' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-neon-blue' : ''} />
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 w-1 h-8 bg-neon-blue rounded-r-md shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors">
          <Settings size={20} />
          <span>Admin Settings</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
