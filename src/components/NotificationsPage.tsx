import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppNotification } from '../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Tag, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  ArrowLeft, 
  Image as ImageIcon, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  Layers, 
  Eye, 
  X,
  Flame,
  Radio,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

export const NotificationsPage: React.FC<{ 
  onBack: () => void; 
  onNavigate?: (page: string, params?: any) => void;
}> = ({ onBack, onNavigate }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification, 
    deleteAllNotifications,
    lang 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return days === 1 
        ? (lang === 'en' ? 'Yesterday' : 'Jana') 
        : (lang === 'en' ? `${days} days ago` : `Siku ${days} zilizopita`);
    }
    if (hours > 0) {
      return lang === 'en' ? `${hours}h ago` : `Masaa ${hours} yaliyopita`;
    }
    if (minutes > 0) {
      return lang === 'en' ? `${minutes}m ago` : `Dakika ${minutes} zilizopita`;
    }
    return lang === 'en' ? 'Just now' : 'Hivi punde';
  };

  const handleActionClick = (actionUrl?: string) => {
    if (!actionUrl) return;
    if (actionUrl.startsWith('#')) {
      const pageId = actionUrl.replace('#', '');
      if (onNavigate) {
        onNavigate(pageId);
      }
    } else if (actionUrl.startsWith('http')) {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 px-3 sm:px-4 pt-2 space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-card border border-theme rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-bg3 border border-theme flex items-center justify-center text-text2 hover:text-text1 transition-colors"
              title="Rudi Nyuma"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base text-text1">
                  {lang === 'en' ? 'Notifications' : 'Taarifa & Matangazo'}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-white animate-pulse">
                    {unreadCount} {lang === 'en' ? 'new' : 'mpya'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text3">
                {lang === 'en' ? 'Stay updated with offers, courses & announcements' : 'Pata ofa za punguzo, masomo mapya na taarifa za mfumo'}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Bell size={20} />
          </div>
        </div>

        {/* Global Toolbar Action buttons */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-theme gap-2 flex-wrap">
            <button
              onClick={markAllNotificationsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-bg3 hover:bg-primary/10 text-text2 hover:text-primary text-[11px] font-bold border border-theme transition-all disabled:opacity-40 disabled:hover:bg-bg3 disabled:hover:text-text2"
            >
              <CheckCheck size={14} />
              <span>{lang === 'en' ? 'Mark all as read' : 'Soma Zote'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(lang === 'en' ? 'Are you sure you want to delete all notifications?' : 'Je, una uhakika unataka kufuta taarifa zote?')) {
                  deleteAllNotifications();
                }
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-bg3 hover:bg-err/10 text-text3 hover:text-err text-[11px] font-bold border border-theme transition-all"
            >
              <Trash2 size={13} />
              <span>{lang === 'en' ? 'Clear all' : 'Futa Zote'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs - Only Zote & Hazijasomwa */}
      <div className="flex gap-2 pb-1">
        {[
          { id: 'all', label: lang === 'en' ? 'All' : 'Zote', icon: Bell, count: notifications.length },
          { id: 'unread', label: lang === 'en' ? 'Unread' : 'Hazijasomwa', icon: Radio, count: unreadCount },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all flex-1 justify-center",
                isActive 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-card border border-theme text-text2 hover:text-text1"
              )}
            >
              <Icon size={13} className={isActive ? "text-white" : "text-text3"} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black",
                  isActive ? "bg-white/20 text-white" : "bg-bg3 text-text3"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card border border-theme rounded-2xl p-10 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-bg3 border border-theme flex items-center justify-center text-text3">
              <Bell size={24} className="opacity-40" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text1">
                {lang === 'en' ? 'No notifications found' : 'Hakuna taarifa yoyote hapa'}
              </h4>
              <p className="text-xs text-text3 mt-1 max-w-xs mx-auto">
                {lang === 'en' 
                  ? 'You are all caught up! New offers, announcements and course updates will appear here.'
                  : 'Taarifa mpya za masomo, ofa za punguzo na matangazo zitaonekana hapa zikitumwa.'}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isOffer = notif.type === 'offer' || notif.offerDiscount || notif.offerCode;
            const isImageOnly = notif.type === 'image' && !notif.message && notif.imageUrl;

            return (
              <div
                key={notif.id}
                className={cn(
                  "bg-card border rounded-2xl p-4 transition-all relative overflow-hidden shadow-xs group",
                  notif.read ? "border-theme opacity-90 hover:opacity-100" : "border-primary/40 bg-primary/[0.02] shadow-sm",
                  isOffer && !notif.read && "border-amber-500/40 bg-amber-500/[0.03]"
                )}
              >
                {/* Unread Glowing indicator on the corner */}
                {!notif.read && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  </div>
                )}

                {/* Top metadata row */}
                <div className="flex items-center gap-2 mb-2 pr-6">
                  {/* Badge */}
                  {isOffer ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                      <Flame size={10} />
                      <span>{notif.offerDiscount || 'OFA MAALUM'}</span>
                    </span>
                  ) : notif.type === 'success' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-ok/15 text-ok border border-ok/30 flex items-center gap-1">
                      <CheckCircle size={10} />
                      <span>TAARIFA</span>
                    </span>
                  ) : notif.type === 'alert' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-warn/15 text-warn border border-warn/30 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      <span>MUHIMU</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>UPDATE</span>
                    </span>
                  )}

                  <span className="text-[11px] text-text3 flex items-center gap-1 font-medium">
                    <Clock size={11} />
                    <span>{formatTimeAgo(notif.createdAt)}</span>
                  </span>
                </div>

                {/* Title */}
                {notif.title && (
                  <h3 className={cn(
                    "font-bold text-sm text-text1 leading-snug mb-1.5",
                    !notif.read && "font-black"
                  )}>
                    {notif.title}
                  </h3>
                )}

                {/* Optional Image Banner / Poster */}
                {notif.imageUrl && notif.imageUrl.length > 5 && (
                  <div 
                    onClick={() => setSelectedImage(notif.imageUrl || null)}
                    className="notif-img-container my-2.5 rounded-xl overflow-hidden border border-theme bg-bg3/60 relative cursor-pointer group/img max-h-56 flex items-center justify-center shadow-xs"
                  >
                    <img 
                      src={notif.imageUrl} 
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const parent = (e.target as HTMLElement).closest('.notif-img-container');
                        if (parent) (parent as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="h-8 px-3 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                        <Eye size={13} />
                        <span>Fungua Picha</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                {notif.message && (
                  <p className="text-xs text-text2 leading-relaxed whitespace-pre-line mb-3">
                    {notif.message}
                  </p>
                )}

                {/* Offer Coupon Box */}
                {notif.offerCode && (
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-primary/10 border border-amber-500/30 rounded-xl mb-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-wider text-amber-500">
                        Kuponi ya Punguzo
                      </div>
                      <div className="font-mono font-black text-sm text-text1 tracking-wider">
                        {notif.offerCode}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(notif.offerCode!)}
                      className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      {copiedCode === notif.offerCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode === notif.offerCode ? 'Imenakiliwa!' : 'Nakili Kuponi'}</span>
                    </button>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-theme gap-2">
                  <div className="flex items-center gap-1">
                    {/* Toggle Read/Unread */}
                    <button
                      onClick={() => {
                        if (notif.read) {
                          // mark unread logic by local state if needed
                        } else {
                          markNotificationRead(notif.id);
                        }
                      }}
                      className={cn(
                        "h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all border",
                        notif.read 
                          ? "bg-bg3/60 border-theme text-text3 hover:text-text1" 
                          : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                      )}
                      title={notif.read ? 'Weka kama haijasomwa' : 'Weka kama imesomwa'}
                    >
                      <Check size={12} />
                      <span>{notif.read ? 'Imesomwa' : 'Weka Imesomwa'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 text-text3 hover:text-err hover:bg-err/10 transition-all border border-transparent hover:border-err/20"
                      title="Futa taarifa hii"
                    >
                      <Trash2 size={12} />
                      <span>Futa</span>
                    </button>
                  </div>

                  {/* Primary CTA Action Link */}
                  {(notif.actionUrl || notif.actionText) && (
                    <button
                      onClick={() => {
                        markNotificationRead(notif.id);
                        handleActionClick(notif.actionUrl);
                      }}
                      className="h-7 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                    >
                      <span>{notif.actionText || 'Fungua'}</span>
                      <ExternalLink size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-lg w-full max-h-[85vh] bg-card rounded-2xl overflow-hidden border border-theme shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-bg3 border-b border-theme flex items-center justify-between">
              <span className="font-bold text-xs text-text1 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" />
                <span>Picha ya Tangazo</span>
              </span>
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-7 h-7 rounded-lg bg-card border border-theme flex items-center justify-center text-text2 hover:text-text1"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[75vh] flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Tangazo preview" 
                className="w-full h-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
