import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDaemon } from './DaemonContext';
import { Activity, LayoutDashboard, Wrench, Settings, Terminal, MessageSquare, Link as LinkIcon, Unlink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header: React.FC = () => {
  const { status, url } = useDaemon();

  const navItems = [
    { to: '/', label: 'Agents', icon: Activity },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tools', label: 'Tools', icon: Wrench },
    { to: '/config', label: 'Config', icon: Settings },
    { to: '/logs', label: 'Logs', icon: Terminal },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-canvas/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <span className="text-canvas font-bold text-lg">E</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-primary">
            Etemaro <span className="font-normal text-muted">Console</span>
          </span>
        </div>

        {/* Zone 2: Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "px-4 py-2 text-sm font-medium transition-all rounded-md flex items-center gap-2",
                isActive 
                  ? "text-accent bg-surface" 
                  : "text-muted hover:text-primary hover:bg-surface/50"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Connection Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono tabular-nums transition-colors",
            status === 'Connected' ? "bg-accent/5 border-accent/20 text-accent" :
            status === 'Connecting' ? "bg-warning/5 border-warning/20 text-warning" :
            "bg-danger/5 border-danger/20 text-danger"
          )}>
            {status === 'Connected' ? <LinkIcon size={12} /> : <Unlink size={12} />}
            <span>{status}</span>
            <span className="opacity-40 px-1">·</span>
            <span className="opacity-60 truncate max-w-[120px]">{url}</span>
          </div>
          
          <button className="hidden sm:block px-4 py-2 text-xs font-medium text-canvas bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
            New Agent
          </button>
        </div>
      </div>
    </header>
  );
};
