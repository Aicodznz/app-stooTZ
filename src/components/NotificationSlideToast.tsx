import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Bell, X, Flame, Sparkles, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export const NotificationSlideToast: React.FC<{
  onOpenNotifications: () => void;
}> = ({ onOpenNotifications }) => {
  const { notifications, markNotificationRead } = useApp();
  const [activeToast, setActiveToast] = useState<any | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Look for the latest unread notification that hasn't been dismissed in this session
    const unread = notifications.find(n => !n.read && !dismissedIds[n.id]);
    if (unread) {
      setActiveToast(unread);
      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setActiveToast(null);
    }
  }, [notifications, dismissedIds]);

  if (!activeToast) return null;

  const isOffer = activeToast.type === 'offer' || activeToast.offerDiscount || activeToast.offerCode;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(prev => ({ ...prev, [activeToast.id]: true }));
    setActiveToast(null);
  };

  const handleClickToast = () => {
    markNotificationRead(activeToast.id);
    setActiveToast(null);
    onOpenNotifications();
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-3 pointer-events-none flex justify-center animate-in slide-in-from-top-4 fade-in duration-300">
      <div 
        onClick={handleClickToast}
        className={cn(
          "pointer-events-auto w-full max-w-md bg-card/95 backdrop-blur-xl border rounded-2xl p-3.5 shadow-xl cursor-pointer hover:scale-[1.01] transition-all flex items-start gap-3 relative overflow-hidden",
          isOffer 
            ? "border-amber-500/50 shadow-amber-500/10" 
            : "border-primary/50 shadow-primary/10"
        )}
      >
        {/* Glowing side accent line */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          isOffer ? "bg-amber-500" : "bg-primary"
        )} />

        {/* Thumbnail or Icon */}
        {activeToast.imageUrl ? (
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-theme bg-bg3 shrink-0 shadow-xs">
            <img 
              src={activeToast.imageUrl} 
              alt="Notification thumbnail" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
            isOffer ? "bg-amber-500/15 text-amber-500" : "bg-primary/15 text-primary"
          )}>
            {isOffer ? <Flame size={20} className="animate-pulse" /> : <Bell size={18} />}
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn(
              "text-[9px] font-black uppercase px-1.5 py-0.2 rounded",
              isOffer ? "bg-amber-500 text-white" : "bg-primary text-white"
            )}>
              {isOffer ? (activeToast.offerDiscount || 'OFA') : 'TAARIFA MPYA'}
            </span>
            <span className="text-[10px] text-text3 font-medium">Hivi punde</span>
          </div>

          <h4 className="font-bold text-xs text-text1 truncate">
            {activeToast.title || 'Tangazo Jipya'}
          </h4>

          {activeToast.message && (
            <p className="text-[11px] text-text3 line-clamp-1 mt-0.5">
              {activeToast.message}
            </p>
          )}

          <div className="flex items-center gap-1 text-[11px] font-bold text-primary mt-1">
            <span>Fungua taarifa</span>
            <ArrowRight size={11} />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-text3 hover:text-text1 hover:bg-bg3 transition-colors"
          title="Funga"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
