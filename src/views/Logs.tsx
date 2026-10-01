import React, { useState, useEffect, useRef } from 'react';
import { useDaemon, LogEntry } from '../components/DaemonContext';
import { Filter, Trash2, Download, Play, Pause, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LogsView: React.FC = () => {
  const { logs: daemonLogs } = useDaemon();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate incoming logs
  useEffect(() => {
    const timer = setInterval(() => {
      const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
      const categories = ['ENGINE', 'STRATEGY', 'RPC', 'WS', 'AGENT'];
      const messages = [
        'Heartbeat sent to agent cluster',
        'Market data received from Binance API',
        'Strategy evaluating trend metrics...',
        'RPC request: get_market_depth initiated',
        'Position adjustment required for agent-02',
        'Connection to daemon stable at 12ms ping',
        'Warning: High volatility detected in SOL/USDC',
        'Error: Failed to fetch liquidity pool states'
      ];

      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };

      setLogs(prev => [...prev.slice(-99), newLog]);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const filteredLogs = logs.filter(l => filter === 'ALL' || l.level === filter);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Live Logs</h1>
          <p className="text-muted mt-1">Real-time telemetry from the Etemaro daemon.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-surface border border-border rounded-lg p-1">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                  filter === f ? "bg-canvas text-primary shadow-sm" : "text-muted hover:text-primary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setLogs([])}
            className="p-2 text-muted hover:text-danger border border-border rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={cn(
              "p-2 border rounded-lg transition-colors",
              isAutoScroll ? "text-accent border-accent/20 bg-accent/5" : "text-muted border-border"
            )}
          >
            {isAutoScroll ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-primary text-canvas rounded-2xl overflow-y-auto p-6 font-mono text-sm selection:bg-accent selection:text-canvas"
      >
        <div className="space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted font-sans italic opacity-40">
              Waiting for log stream...
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="group flex items-start gap-4 hover:bg-white/5 py-0.5 rounded transition-colors px-2">
                <span className="text-muted/60 shrink-0 w-20 tabular-nums">{log.timestamp}</span>
                <span className={cn(
                  "shrink-0 w-16 font-bold",
                  log.level === 'INFO' ? "text-accent" :
                  log.level === 'WARN' ? "text-warning" : "text-danger"
                )}>
                  [{log.level}]
                </span>
                <span className="text-muted/80 shrink-0 w-24">({log.category})</span>
                <span className="text-canvas/90">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted px-2 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-4">
          <span>Buffer: {logs.length}/100</span>
          <span>Stream: WebSocket JSON-RPC</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Listening for events...</span>
        </div>
      </div>
    </div>
  );
};
