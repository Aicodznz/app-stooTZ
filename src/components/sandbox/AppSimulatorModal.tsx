import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Smartphone, 
  Wifi, 
  Battery, 
  Bell, 
  Maximize2, 
  ArrowLeft,
  Volume2,
  Share2
} from 'lucide-react';
import { ApkBuildConfig } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  config: ApkBuildConfig;
  htmlContent: string;
  onClose: () => void;
  activeNotification?: { title: string; message: string; icon?: string } | null;
  onDismissNotification?: () => void;
}

export const AppSimulatorModal: React.FC<Props> = ({
  config,
  htmlContent,
  onClose,
  activeNotification,
  onDismissNotification
}) => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTime, setCurrentTime] = useState('12:45');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    
    // Simulate splash screen timeout
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!showSplash && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        // Inject custom CSS / JS if specified
        let finalHtml = htmlContent;
        if (config.customCss) {
          finalHtml = finalHtml.replace('</head>', `<style>${config.customCss}</style></head>`);
        }
        if (config.customJs) {
          finalHtml = finalHtml.replace('</body>', `<script>${config.customJs}</script></body>`);
        }
        doc.write(finalHtml);
        doc.close();
      }
    }
  }, [showSplash, htmlContent, config.customCss, config.customJs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto page-anim">
      <div className="relative w-full max-w-md my-auto flex flex-col items-center">
        
        {/* Controls Above Phone */}
        <div className="w-full flex items-center justify-between text-white mb-3 px-2">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-emerald-400" />
            <span className="text-xs font-black tracking-wide">
              {config.appName} • {config.versionName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="Reload App"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <RotateCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Mobile Phone Mockup Frame */}
        <div className="w-[320px] sm:w-[350px] h-[640px] sm:h-[680px] bg-slate-950 rounded-[42px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
          
          {/* Top Notch & Camera Pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          {/* Android Status Bar with Dynamic Status Bar Color */}
          <div 
            className="w-full h-8 px-4 flex items-center justify-between text-[10px] font-semibold text-white z-40 rounded-t-[30px] shrink-0 transition-colors"
            style={{ backgroundColor: config.statusBarColor || '#2563eb' }}
          >
            <span className="font-mono">{currentTime}</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Wifi size={11} />
              <Battery size={13} className="fill-white" />
            </div>
          </div>

          {/* Real simulated Push Notification Banner popup if dispatched */}
          {activeNotification && (
            <div className="absolute top-12 left-3 right-3 z-50 bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs shrink-0 font-bold shadow-md"
                  style={{ backgroundColor: config.statusBarColor || '#6366f1' }}
                >
                  {config.appIconEmoji || '🌸'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white truncate">{activeNotification.title}</span>
                    <span className="text-[9px] text-slate-400">now</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                    {activeNotification.message}
                  </p>
                </div>
                {onDismissNotification && (
                  <button 
                    onClick={onDismissNotification}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* App Screen Content Area */}
          <div className="flex-1 w-full bg-white relative rounded-b-[30px] overflow-hidden flex flex-col">
            
            {/* Optional Title Bar if not hidden */}
            {!config.hideTitleBar && (
              <div 
                className="h-11 px-3 flex items-center justify-between text-white shrink-0 shadow-sm"
                style={{ backgroundColor: config.statusBarColor || '#2563eb' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs">
                    {config.appIconEmoji || '🌸'}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[160px]">{config.appName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.pullToRefresh && (
                    <button onClick={handleRefresh} className="p-1 hover:bg-white/10 rounded-lg">
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Splash Screen */}
            {showSplash ? (
              <div 
                className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white space-y-4 animate-in fade-in"
                style={{ backgroundColor: config.splashScreenColor || config.statusBarColor || '#1e293b' }}
              >
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border border-white/20 animate-bounce"
                  style={{ backgroundColor: config.appIconBg || '#6366f1' }}
                >
                  {config.appIconEmoji || '🌸'}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black tracking-wider text-white">{config.appName}</h3>
                  <p className="text-[10px] text-white/70 font-mono">Version {config.versionName}</p>
                </div>
                {config.loadingSpinner && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="Mobile App Webview"
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="w-full flex-1 border-0 bg-slate-900"
              />
            )}

            {/* Bottom Android Home Indicator / Navigation Bar */}
            <div className="h-4 bg-black w-full flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-slate-600 rounded-full" />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
