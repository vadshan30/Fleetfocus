import React from 'react';
import Icon from '../ui/Icon';

const TABS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'trip', label: 'Current Trip', icon: 'Navigation' },
  { id: 'map', label: 'Map', icon: 'Map' },
  { id: 'profile', label: 'Profile', icon: 'User' },
];

const DriverBottomNav = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      aria-label="Driver Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 h-12 min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-blue-50 dark:bg-blue-950/60' : ''
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </div>
              <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverBottomNav;
