import React, { useState } from 'react';
import { useDaemon, Agent } from '../components/DaemonContext';
import { Play, Square, RefreshCcw, Info, CheckCircle2, AlertCircle, Clock, Database, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AgentsView: React.FC = () => {
  const { agents, strategies } = useDaemon();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id || null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [pendingStrategy, setPendingStrategy] = useState<string | null>(null);

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingStrategy(e.target.value);
    setIsDiffOpen(true);
  };

  const confirmStrategySwitch = () => {
    // In real app, call executeRPC
    setIsDiffOpen(false);
    setPendingStrategy(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Strategy Diff Modal */}
      <AnimatePresence>
        {isDiffOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDiffOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-canvas rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border bg-surface">
                <h3 className="text-lg font-bold">Strategy Switch Preview</h3>
                <p className="text-xs text-muted">Review parameter changes before committing to the daemon.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-muted">Current: {selectedAgent?.strategyId}</span>
                    <pre className="p-3 bg-surface border border-border rounded-lg text-[10px] font-mono overflow-auto max-h-48">
                      {JSON.stringify(strategies.find(s => s.id === selectedAgent?.strategyId)?.params, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-accent">Pending: {pendingStrategy}</span>
                    <pre className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-[10px] font-mono overflow-auto max-h-48">
                      {JSON.stringify(strategies.find(s => s.id === pendingStrategy)?.params, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsDiffOpen(false)}
                    className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmStrategySwitch}
                    className="flex-1 py-2.5 text-sm font-bold bg-accent text-canvas rounded-lg hover:bg-accent/90 transition-all"
                  >
                    Commit Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Fleet Overview</h1>
          <p className="text-muted mt-1">Manage and monitor your active agent cluster.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{agents.length} Agents Active</span>
          <span aria-hidden="true">·</span>
          <span>1.4s Avg Latency</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Cards Grid */}
        <div className="lg:col-span-1 space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={cn(
                "w-full text-left p-5 rounded-xl border transition-all group cursor-pointer",
                selectedAgentId === agent.id 
                  ? "bg-surface border-accent shadow-sm" 
                  : "bg-canvas border-border hover:border-accent/40 hover:bg-surface/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    agent.status === 'active' ? "bg-accent" :
                    agent.status === 'degraded' ? "bg-warning" : "bg-danger"
                  )} />
                  <span className="font-bold text-primary">{agent.id}</span>
                </div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{agent.status}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {agent.uptime}</span>
                  <span className="flex items-center gap-1.5 font-mono">{agent.pair}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5"><Database size={12} /> {agent.strategyId}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); /* Restart logic */ }}
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-canvas border border-border rounded-md hover:border-accent hover:text-accent transition-colors"
                >
                  Restart
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); /* Stop logic */ }}
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-canvas border border-border rounded-md hover:border-danger hover:text-danger transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visualizer Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAgent ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-surface border border-border rounded-2xl p-8 shadow-sm"
              >
                {/* Pipeline Visualizer */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Pipeline Pipeline</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">Confidence</span>
                        <span className="text-xs font-mono font-bold text-accent">{(selectedAgent.metrics.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border -translate-y-1/2" />
                    
                    {['idle', 'evaluating', 'rebalancing', 'settled'].map((state, i) => {
                      const isActive = selectedAgent.pipelineState === state;
                      return (
                        <div key={state} className="relative z-10 flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                            isActive ? "bg-accent border-accent text-canvas scale-110 shadow-lg shadow-accent/20" : "bg-surface border-border text-muted"
                          )}>
                            {i === 0 && <Clock size={16} />}
                            {i === 1 && <RefreshCcw size={16} className={isActive ? "animate-spin-slow" : ""} />}
                            {i === 2 && <Activity size={16} />}
                            {i === 3 && <CheckCircle2 size={16} />}
                          </div>
                          <span className={cn(
                            "absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                            isActive ? "text-accent" : "text-muted opacity-60"
                          )}>
                            {state}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border/50">
                  <div>
                    <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">Price Range</span>
                    <span className="text-sm font-mono font-bold">
                      {selectedAgent.metrics.priceRange[0]} - {selectedAgent.metrics.priceRange[1]}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">In Range</span>
                    <span className={cn(
                      "text-sm font-bold flex items-center gap-1.5",
                      selectedAgent.metrics.inRange ? "text-accent" : "text-danger"
                    )}>
                      {selectedAgent.metrics.inRange ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {selectedAgent.metrics.inRange ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">Asset Split</span>
                    <span className="text-sm font-mono font-bold">
                      {selectedAgent.metrics.assetSplit.base}% / {selectedAgent.metrics.assetSplit.quote}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">Last Tool</span>
                    <span className="text-sm font-mono text-muted truncate block">
                      {selectedAgent.metrics.lastTool}
                    </span>
                  </div>
                </div>

                {/* Execution Summary */}
                <div className="mt-8">
                  <span className="block text-[10px] text-muted uppercase tracking-wider mb-3">Execution Summary</span>
                  <div className="p-4 bg-canvas border border-border rounded-lg font-mono text-xs text-primary/80 leading-relaxed">
                    {selectedAgent.metrics.lastDecision}
                  </div>
                </div>

                {/* Strategy Switch */}
                <div className="mt-12 pt-8 border-t border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold">Strategy Configuration</h4>
                    <button className="text-xs text-accent hover:underline flex items-center gap-1">
                      View full config <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedAgent.strategyId}
                      onChange={handleStrategyChange}
                      className="flex-1 bg-canvas border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-accent outline-none"
                    >
                      {strategies.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted">
              Select an agent to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
