/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DaemonProvider } from './components/DaemonContext';
import { Header } from './components/Header';
import { AgentsView } from './views/Agents';
import { LogsView } from './views/Logs';
import { ToolsView } from './views/Tools';

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12">
      <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-6">
        <span className="text-accent font-bold text-2xl">?</span>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
      <p className="text-muted max-w-sm">
        This module is scheduled for implementation in Phase 2. Current active modules include Agents, Tools, and Logs.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <DaemonProvider>
        <div className="min-h-screen bg-canvas flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-6 py-12">
            <Routes>
              <Route path="/" element={<AgentsView />} />
              <Route path="/dashboard" element={<PlaceholderView title="Performance Dashboard" />} />
              <Route path="/tools" element={<ToolsView />} />
              <Route path="/config" element={<PlaceholderView title="Daemon Configuration" />} />
              <Route path="/logs" element={<LogsView />} />
              <Route path="/chat" element={<PlaceholderView title="Operator Chat" />} />
            </Routes>
          </main>
        </div>
      </DaemonProvider>
    </Router>
  );
}
