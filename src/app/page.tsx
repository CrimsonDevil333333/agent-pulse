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
  const [aura, setAura] = useState({ theme: "#3b82f6", persona: "Standard Node", mood: "Standby" });

  useEffect(() => {
    const hydrate = async () => {
      // 1. Fetch last aura
      const auraRes = await fetch("/api/pulse/aura");
      const auraData = await auraRes.json();
      if (auraData && auraData.payload) setAura(auraData.payload);

      // 2. Fetch last visual
      const visualRes = await fetch("/api/pulse/visual");
      const visualData = await visualRes.json();
      if (visualData && visualData.payload) {
        setVisual(`/api/render?file=${visualData.payload}&t=${Date.now()}`);
      }

      // 3. Fetch history
      const historyRes = await fetch("/api/pulse/history");
      const historyData = await historyRes.json();
      if (Array.isArray(historyData)) {
        const formattedHistory = historyData
          .filter(data => !data.type || data.type === "log")
          .map(data => ({
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            agent: data.agent || "SYSTEM",
            action: data.action || "INFO",
            message: data.message || "",
          })).reverse();
        setLogs(formattedHistory);
      }

      // 4. Connect to live stream
      const eventSource = new EventSource("/api/pulse");
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "visual") setVisual(`/api/render?file=${data.payload}&t=${Date.now()}`);
        if (data.type === "vitals") setVitals(data.payload);
        if (data.type === "aura") setAura(data.payload);
        
        if (!data.type || data.type === "log") {
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
        }
      };
      return eventSource;
    };

    let es: EventSource;
    hydrate().then(eventSource => { es = eventSource; });
    return () => { if (es) es.close(); };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "logic", label: "Logic Trace" },
    { id: "aura", label: "Aura Manager" },
    { id: "vitals", label: "System Vitals" },
  ];

  return (
    <div className="flex h-screen w-full bg-black text-[#fafafa] font-sans antialiased overflow-hidden" style={{ "--theme-color": aura.theme } as any}>
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050505] border-r border-[#18181b] transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col p-10
      `}>
        <div className="flex items-center gap-3 mb-16 group">
          <div className="text-[22px] font-black tracking-tighter uppercase flex items-center gap-2" style={{ color: aura.theme }}>
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
              <span style={view === item.id ? { color: aura.theme } : {}} className="mr-2">•</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="text-[13px] font-black uppercase tracking-[0.2em] text-left hover:opacity-80 transition-opacity" style={{ color: aura.theme }}>
          Settings
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Overlay */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-black border-b border-[#18181b]">
          <div className="text-lg font-black tracking-tight" style={{ color: aura.theme }}>PULSE</div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-zinc-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {/* Global Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-10 py-10 gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">{aura.persona}</h1>
            <p className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              Uptime: 2d 4h 12m <span className="text-zinc-800">|</span> Mood: <span style={{ color: aura.theme }}>{aura.mood}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border text-[11px] font-black tracking-widest uppercase" style={{ borderColor: `${aura.theme}33`, backgroundColor: `${aura.theme}0D`, color: aura.theme }}>
            <div className="relative flex items-center justify-center w-2 h-2">
              <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ backgroundColor: aura.theme }}></div>
              <div className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: aura.theme }}></div>
            </div>
            Live Broadcasting
          </div>
        </header>

        {/* View Layout */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          {view === "dashboard" && <DashboardView visual={visual} logs={logs} theme={aura.theme} />}
          {view === "logic" && <TraceView logs={logs} theme={aura.theme} />}
          {view === "vitals" && <VitalsView vitals={vitals} theme={aura.theme} />}
          {view === "aura" && <AuraView aura={aura} />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ visual, logs, theme }: any) {
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
            <div className="text-center opacity-10 scale-150 grayscale text-4xl">🦞</div>
          )}
        </section>
      </div>

      {/* Sidebar Trace */}
      <div className="space-y-6 flex flex-col min-h-[500px]">
        <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 md:text-right">Live_Logic_Trace</h3>
        <section className="flex-1 bg-[#09090b] border border-[#18181b] rounded-3xl flex flex-col overflow-hidden shadow-xl p-8">
          <div className="space-y-10 overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log: any) => (
              <div key={log.id} className="space-y-2 border-l border-white/5 pl-4 ml-1">
                <div className="text-[10px] font-mono text-zinc-600 tracking-tight">{log.time}</div>
                <div className="text-[11px] font-black uppercase tracking-widest italic" style={{ color: theme }}>{log.action}</div>
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

function TraceView({ logs, theme }: any) {
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
          <div key={log.id} className="bg-[#09090b] border border-[#18181b] rounded-2xl p-8 flex gap-8 hover:border-white/10 transition-all group">
            <div className="w-24 shrink-0 font-mono text-[11px] text-zinc-700 uppercase pt-1 font-black group-hover:text-zinc-500 transition-colors">{log.time}</div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-tighter italic" style={{ color: theme }}>{log.action}</span>
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

function VitalsView({ vitals, theme }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {[
        { label: "Processor_Load", val: vitals.cpu, color: theme, sub: "Broadcasting_Core" },
        { label: "Physical_Memory", val: vitals.ram, color: "#10b981", sub: "LPDDR5_Allocated" },
        { label: "Core_Telemetry", val: vitals.temp, color: "#f59e0b", sub: "Thermal_Package" }
      ].map((v) => (
        <div key={v.label} className="bg-[#09090b] border border-[#18181b] p-12 rounded-[40px] shadow-2xl space-y-8 group hover:translate-y-[-8px] transition-all duration-500">
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-hover:text-zinc-500 transition-colors">{v.label}</span>
          <div className="text-6xl font-black tracking-tighter italic" style={{ color: v.color }}>{v.val}</div>
          <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] pt-8 border-t border-zinc-900 group-hover:text-zinc-400 transition-colors">{v.sub}</div>
        </div>
      ))}
    </div>
  );
}

function AuraView({ aura }: any) {
  const updateAura = async (newAura: any) => {
    await fetch("/api/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "aura", payload: newAura }),
    });
    // Also log it
    await fetch("/api/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "SYSTEM", action: "AURA", message: `Identity updated to ${newAura.persona} (${newAura.theme})`, type: "log" }),
    });
  };

  const personas = [
    { name: "Standard Node", theme: "#3b82f6", mood: "Standby", icon: "🤖" },
    { name: "Expert Dev Node", theme: "#ff3e00", mood: "Focused", icon: "🦞" },
    { name: "Cyber Ninja Node", theme: "#10b981", mood: "Stealth", icon: "🥷" },
    { name: "Deep Thinker Node", theme: "#a855f7", mood: "Reasoning", icon: "🧠" },
  ];

  const currentPersonaName = aura.name || aura.persona;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-700 py-10">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Aura_Manager</h2>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em]">Identity & Protocol Synchronization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {personas.map((p) => (
          <button
            key={p.name}
            onClick={() => updateAura({ theme: p.theme, persona: p.name, mood: p.mood })}
            className={`group bg-[#09090b] border p-10 rounded-[32px] text-left transition-all hover:scale-[1.02] active:scale-95 ${
              currentPersonaName === p.name ? "border-white/20 ring-1 ring-white/10" : "border-[#18181b]"
            }`}
          >
            <div className="flex justify-between items-start mb-8">
              <span className={`text-4xl transition-all ${currentPersonaName === p.name ? "" : "grayscale group-hover:grayscale-0"}`}>{p.icon}</span>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme }}></div>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 italic">{p.name}</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Protocol: {p.mood}</p>
            {currentPersonaName === p.name && (
              <div className="mt-6 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: p.theme }}>
                Active_Signature
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#ff3e00]/5 border border-[#ff3e00]/10 p-8 rounded-2xl mt-12 text-center">
        <p className="text-[#ff3e00] text-[10px] font-black uppercase tracking-[0.3em]">
          Warning: Aura shifts affect global UI rendering and agent response signatures.
        </p>
      </div>
    </div>
  );
}
