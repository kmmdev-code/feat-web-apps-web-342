import React, { useState } from 'react';
import { useDaemon } from '../components/DaemonContext';
import { Search, Copy, Terminal, Play, Check, ChevronRight, RefreshCcw, Wrench } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  schema: {
    properties: Record<string, any>;
    required: string[];
  };
}

const MOCK_TOOLS: Tool[] = [
  {
    id: 'get_market_depth',
    name: 'Get Market Depth',
    description: 'Fetch order book depth for a specific pair.',
    category: 'Market Data',
    schema: {
      properties: {
        pair: { type: 'string', placeholder: 'ETH/USDC' },
        limit: { type: 'number', placeholder: '100' }
      },
      required: ['pair']
    }
  },
  {
    id: 'adjust_position',
    name: 'Adjust Position',
    description: 'Execute rebalancing for an agent.',
    category: 'Execution',
    schema: {
      properties: {
        agentId: { type: 'string', placeholder: 'agent-01' },
        ratio: { type: 'number', placeholder: '0.5' },
        slippage: { type: 'number', placeholder: '0.01' }
      },
      required: ['agentId', 'ratio']
    }
  },
  {
    id: 'check_balance',
    name: 'Check Balance',
    description: 'Retrieve current wallet balances.',
    category: 'Account',
    schema: {
      properties: {
        chain: { type: 'string', placeholder: 'ethereum' }
      },
      required: ['chain']
    }
  }
];

export const ToolsView: React.FC = () => {
  const { executeRPC } = useDaemon();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(MOCK_TOOLS[0]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const result = await executeRPC(selectedTool!.id, formData);
      setExecutionResult({
        timestamp: new Date().toISOString(),
        method: selectedTool!.id,
        params: formData,
        response: {
          status: 'success',
          latency: '124ms',
          data: {
            id: 'tx_823491',
            explorer: 'https://etherscan.io/tx/0x...',
            summary: 'Operation completed successfully'
          }
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Tool Catalog</h1>
          <p className="text-muted mt-1">Direct RPC execution for daemon tools.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search tools..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          {MOCK_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool);
                setFormData({});
                setExecutionResult(null);
              }}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                selectedTool?.id === tool.id 
                  ? "bg-accent text-canvas border-accent" 
                  : "bg-canvas text-primary border-border hover:bg-surface"
              )}
            >
              <div>
                <span className="block font-bold text-sm">{tool.name}</span>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-bold opacity-60",
                  selectedTool?.id === tool.id ? "text-canvas" : "text-muted"
                )}>
                  {tool.category}
                </span>
              </div>
              <ChevronRight size={16} className={cn(
                "transition-transform",
                selectedTool?.id === tool.id ? "translate-x-1" : "opacity-0"
              )} />
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-8">
        {selectedTool ? (
          <>
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-2">{selectedTool.name}</h2>
                <p className="text-muted text-sm">{selectedTool.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(selectedTool.schema.properties).map(([key, schema]) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                      {key} {selectedTool.schema.required.includes(key) && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type={schema.type === 'number' ? 'number' : 'text'}
                      placeholder={schema.placeholder}
                      value={formData[key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full md:w-auto px-8 py-3 bg-primary text-canvas rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isExecuting ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={18} />}
                {isExecuting ? 'Executing...' : 'Run Tool'}
              </button>
            </div>

            {executionResult && (
              <div className="bg-primary text-canvas rounded-2xl p-8 overflow-hidden animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-accent" />
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Output Response</h3>
                  </div>
                  <button 
                    onClick={copyResult}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold"
                  >
                    {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="font-mono text-xs text-canvas/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted p-12 text-center">
            <Wrench size={48} className="mb-4 opacity-20" />
            <p className="max-w-xs">Select a tool from the catalog to configure and execute RPC commands.</p>
          </div>
        )}
      </div>
    </div>
  );
};
