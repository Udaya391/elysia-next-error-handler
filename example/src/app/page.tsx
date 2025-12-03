"use client";

import { useState } from "react";

// Simple Icons
const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState<string | null>(null);

  const callApi = async (path: string, options?: RequestInit) => {
    setLoading(true);
    setActivePath(path);
    setResponse(null);
    setStatus(null);
    
    try {
      const res = await fetch(path, options);
      setStatus(res.status);
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setResponse(data);
      } else {
        const text = await res.text();
        // Try to parse JSON even if content-type is wrong, otherwise text
        try {
            setResponse(JSON.parse(text));
        } catch {
            setResponse(text.slice(0, 1000) + (text.length > 1000 ? "..." : ""));
        }
      }
    } catch (error) {
      console.error(error);
      setResponse({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  };

  const EndpointCard = ({ 
    title, 
    method, 
    path, 
    description, 
    onRun, 
    canOpen = true 
  }: { 
    title: string, 
    method: "GET" | "POST", 
    path: string, 
    description: string, 
    onRun: () => void,
    canOpen?: boolean
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            method === "GET" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          }`}>
            {method}
          </span>
        </div>
        <code className="text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded block w-fit mb-3">
          {path}
        </code>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onRun}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && activePath === path ? <RefreshIcon /> : <PlayIcon />}
            Run Request
          </button>
          
          {canOpen && (
            <a 
              href={path} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ExternalLinkIcon />
              Open Tab
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Elysia <span className="text-slate-400">×</span> Next.js
          </h1>
          <p className="text-lg text-slate-600">
            Error handling and API integration playground.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: API Controls */}
          <div className="lg:col-span-7 space-y-6">
            <EndpointCard 
              title="Standard Success" 
              method="GET" 
              path="/api/hello" 
              description="Returns a simple JSON response with a 200 OK status."
              onRun={() => callApi("/api/hello")}
            />

            <EndpointCard 
              title="Custom API Error" 
              method="GET" 
              path="/api/error" 
              description="Throws a custom APIError (400 Bad Request) which is caught and formatted by the plugin."
              onRun={() => callApi("/api/error")}
            />

            <EndpointCard 
              title="Next.js Not Found" 
              method="GET" 
              path="/api/next-not-found" 
              description="Triggers Next.js notFound(). The plugin ensures this bubbles up to Next.js correctly."
              onRun={() => callApi("/api/next-not-found")}
            />

            <EndpointCard 
              title="Next.js Redirect" 
              method="GET" 
              path="/api/next-redirect" 
              description="Triggers Next.js redirect('/'). The plugin ensures this bubbles up to Next.js correctly."
              onRun={() => callApi("/api/next-redirect")}
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow p-5">
               <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Validation Error</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  POST
                </span>
              </div>
              <code className="text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded block w-fit mb-3">
                /api/validate
              </code>
              <p className="text-sm text-slate-600 mb-4">
                Tests Elysia's schema validation. Requires <code>name</code> (string) and <code>age</code> (number).
              </p>
              <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={() => callApi("/api/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "Test" }) // Missing age
                  })}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  <PlayIcon />
                  Test Invalid
                </button>
                 <button 
                  onClick={() => callApi("/api/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: "Test", age: 25 }) 
                  })}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                >
                  <PlayIcon />
                  Test Valid
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Console Output */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  <span className="ml-2 text-xs font-medium text-slate-400">Console Output</span>
                </div>
                {status && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    status >= 200 && status < 300 ? "bg-green-500/20 text-green-400" :
                    status >= 400 ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    Status: {status}
                  </span>
                )}
              </div>
              
              <div className="p-4 min-h-[300px] max-h-[calc(100vh-200px)] overflow-auto custom-scrollbar">
                {response ? (
                  <pre className="font-mono text-sm text-slate-50 whitespace-pre-wrap break-all">
                    {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 min-h-[200px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                    <p className="text-sm">Ready to run requests...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center">
               <p className="text-xs text-slate-400">
                  Tip: Check the browser developer tools Network tab for full request details.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
