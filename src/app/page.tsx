"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  time: string;
  agent: string;
  action: string;
  message: string;
}

export default function Home() {
  const [view, setView] = useState("dashboard");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visual, setVisual] = useState<string | null>(null);
  const [vitals, setVitals] = useState({ cpu: "18%", temp: "46°C", ram: "4.8 / 16GB" });
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/pulse");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "visual") setVisual(`/api/render?file=${data.payload}&t=${Date.now()}`);
      if (data.type === "vitals") setVitals(data.payload);
      
      setLogs((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          agent: data.agent || "CLAW",
          action: data.action || "INFO",
          message: data.message || "",
        },
        ...prev.slice(0, 99),
      ]);
    };
    return () => eventSource.close();
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "logic", label: "Logic Trace" },
    { id: "aura", label: "Aura Manager" },
    { id: "vitals", label: "System Vitals" },
  ];

  return (
    <div className="flex h-screen w-full bg-black text-[#fafafa] font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050505] border-r border-[#18181b] transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col p-10
      `}>
        <div className="flex items-center gap-3 mb-16 group">
          <div className="text-[22px] font-black text-[#ff3e00] tracking-tighter uppercase flex items-center gap-2">
            AGENT-PULSE <span className="text-sm">🦞</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-[15px] font-bold tracking-tight transition-all ${
                view === item.id 
                  ? 'bg-[#141417] text-white border border-[#27272a] shadow-lg shadow-black/50' 
                  : 'text-[#52525b] hover:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="text-[13px] text-[#ff3e00] font-black uppercase tracking-[0.2em] text-left hover:opacity-80 transition-opacity">
          Settings
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Overlay */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-black border-b border-[#18181b]">
          <div className="text-lg font-black tracking-tight text-[#ff3e00]">PULSE</div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-zinc-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {/* Global Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-10 py-10 gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">SatyaaClawdy Node</h1>
            <p className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              Uptime: 2d 4h 12m <span className="text-zinc-800">|</span> Pi5 (Headless)
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-[11px] font-black tracking-widest uppercase">
            <div className="relative flex items-center justify-center w-2 h-2">
              <div className="absolute inset-0 bg-[#10b981] rounded-full animate-pulse-ring"></div>
              <div className="relative w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
            </div>
            Live Broadcasting
          </div>
        </header>

        {/* View Layout */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          {view === "dashboard" && <DashboardView visual={visual} logs={logs} />}
          {view === "logic" && <TraceView logs={logs} />}
          {view === "vitals" && <VitalsView vitals={vitals} />}
          {view === "aura" && <AuraView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ visual, logs }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Viewport */}
      <div className="space-y-6">
        <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2">Visual_Pulse_Buffer</h3>
        <section className="aspect-video bg-[#050505] border border-[#18181b] rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center group ring-1 ring-white/[0.02]">
          <div className="absolute top-6 left-6 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/5 rounded-lg text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            CANVAS RENDER (APT-AURA)
          </div>
          {visual ? (
            <img src={visual} className="w-full h-full object-contain p-10 animate-in fade-in duration-700" alt="visual" />
          ) : (
            <div className="text-center opacity-10 scale-150 grayscale">🦞</div>
          )}
        </section>
      </div>

      {/* Sidebar Trace */}
      <div className="space-y-6 flex flex-col min-h-[500px]">
        <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 md:text-right">Live_Logic_Trace</h3>
        <section className="flex-1 bg-[#09090b] border border-[#18181b] rounded-3xl flex flex-col overflow-hidden shadow-xl p-8">
          <div className="space-y-10 overflow-y-auto custom-scrollbar">
            {logs.slice(0, 6).map((log: any) => (
              <div key={log.id} className="space-y-2">
                <div className="text-[10px] font-mono text-zinc-600 tracking-tight">{log.time}</div>
                <div className="text-[11px] font-black text-[#ff3e00] uppercase tracking-widest italic">{log.action}</div>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">{log.message}</p>
              </div>
            ))}
            {logs.length === 0 && <div className="h-full flex items-center justify-center text-zinc-800 text-[10px] uppercase tracking-widest font-black">Waiting for pulse...</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function TraceView({ logs }: any) {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-zinc-800/50 pb-8">
        <div>
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">System_Internal_Protocol</h3>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Full_Logic_Trace</h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-700 font-black uppercase bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">{logs.length} Operations_Stored</span>
      </div>
      <div className="space-y-4">
        {logs.map((log: any) => (
          <div key={log.id} className="bg-[#09090b] border border-[#18181b] rounded-2xl p-8 flex gap-8 hover:border-[#ff3e00]/20 transition-all group">
            <div className="w-24 shrink-0 font-mono text-[11px] text-zinc-700 uppercase pt-1 font-black group-hover:text-zinc-500 transition-colors">{log.time}</div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-[#ff3e00] uppercase tracking-tighter italic">{log.action}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-600 font-black border border-white/5 uppercase tracking-widest">{log.agent}</span>
              </div>
              <p className="text-[15px] text-zinc-300 leading-relaxed font-medium group-hover:text-white transition-colors">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VitalsView({ vitals }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {[
        { label: "Processor_Load", val: vitals.cpu, color: "text-[#ff3e00]", sub: "Broadcasting_Core" },
        { label: "Physical_Memory", val: vitals.ram, color: "text-[#10b981]", sub: "LPDDR5_Allocated" },
        { label: "Core_Telemetry", val: vitals.temp, color: "text-[#f59e0b]", sub: "Thermal_Package" }
      ].map((v) => (
        <div key={v.label} className="bg-[#09090b] border border-[#18181b] p-12 rounded-[40px] shadow-2xl space-y-8 group hover:translate-y-[-8px] transition-all duration-500">
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-hover:text-zinc-500 transition-colors">{v.label}</span>
          <div className={`text-6xl font-black tracking-tighter italic ${v.color}`}>{v.val}</div>
          <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] pt-8 border-t border-zinc-900 group-hover:text-zinc-400 transition-colors">{v.sub}</div>
        </div>
      ))}
    </div>
  );
}

function AuraView() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 duration-700">
      <div className="text-[120px] grayscale opacity-10">🌌</div>
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Aura_Manager</h2>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em]">Functional Handshake Pending</p>
      </div>
    </div>
  );
}
