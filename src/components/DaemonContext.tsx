import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

type ConnectionStatus = 'Connected' | 'Connecting' | 'Disconnected';

interface DaemonContextType {
  status: ConnectionStatus;
  url: string;
  token: string | null;
  setToken: (token: string | null) => void;
  logs: LogEntry[];
  agents: Agent[];
  strategies: Strategy[];
  executeRPC: (method: string, params?: any) => Promise<any>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  category: string;
  message: string;
}

export interface Agent {
  id: string;
  status: 'active' | 'degraded' | 'stopped' | 'error';
  strategyId: string;
  uptime: string;
  lastHeartbeat: string;
  pair: string;
  pipelineState: 'idle' | 'evaluating' | 'rebalancing' | 'settled';
  metrics: {
    priceRange: [number, number];
    inRange: boolean;
    assetSplit: { base: number; quote: number };
    lastDecision: string;
    lastTool: string;
    confidence: number;
  };
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  params: Record<string, any>;
}

const DaemonContext = createContext<DaemonContextType | null>(null);

export const useDaemon = () => {
  const context = useContext(DaemonContext);
  if (!context) throw new Error('useDaemon must be used within DaemonProvider');
  return context;
};

export const DaemonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('Disconnected');
  const [url] = useState(import.meta.env.VITE_DAEMON_URL || 'http://127.0.0.1:8765');
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('etemaro.token'));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('etemaro.token', newToken);
    } else {
      localStorage.removeItem('etemaro.token');
    }
    setTokenState(newToken);
  };

  const connect = () => {
    if (wsRef.current) wsRef.current.close();
    setStatus('Connecting');

    // In a real app, we'd use the actual daemon URL
    // For this demo, we'll simulate connection and data
    const wsUrl = url.replace('http', 'ws');
    
    // Simulating WebSocket for the visualizer
    // In production, this would be: wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);
    
    setTimeout(() => {
      setStatus('Connected');
      // Mock initial data
      setAgents([
        {
          id: 'agent-01',
          status: 'active',
          strategyId: 'trend-follower-v1',
          uptime: '12d 4h 22m',
          lastHeartbeat: new Date().toISOString(),
          pair: 'ETH/USDC',
          pipelineState: 'evaluating',
          metrics: {
            priceRange: [2450, 2600],
            inRange: true,
            assetSplit: { base: 45, quote: 55 },
            lastDecision: 'Maintain position; volatility within bounds',
            lastTool: 'get_market_depth',
            confidence: 0.94
          }
        },
        {
          id: 'agent-02',
          status: 'degraded',
          strategyId: 'grid-master-pro',
          uptime: '3d 18h 05m',
          lastHeartbeat: new Date().toISOString(),
          pair: 'SOL/USDC',
          pipelineState: 'idle',
          metrics: {
            priceRange: [95, 115],
            inRange: false,
            assetSplit: { base: 12, quote: 88 },
            lastDecision: 'Wait for price reentry into grid',
            lastTool: 'check_balance',
            confidence: 0.81
          }
        }
      ]);
      setStrategies([
        { id: 'trend-follower-v1', name: 'Trend Follower V1', description: 'Moving average crossover strategy', params: { period: 14, threshold: 0.05 } },
        { id: 'grid-master-pro', name: 'Grid Master Pro', description: 'Dynamic grid trading with auto-rebalance', params: { grids: 10, range: 0.1 } }
      ]);
    }, 1000);
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [url, token]);

  const executeRPC = async (method: string, params: any = {}) => {
    // Mock RPC execution
    console.log(`Executing RPC: ${method}`, params);
    return { status: 'success', data: {} };
  };

  return (
    <DaemonContext.Provider value={{ status, url, token, setToken, logs, agents, strategies, executeRPC }}>
      {children}
    </DaemonContext.Provider>
  );
};
