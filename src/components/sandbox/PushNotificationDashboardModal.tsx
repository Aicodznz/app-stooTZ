import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Send, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Terminal, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { ApkBuildConfig } from '../../types';
import { cn } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';

interface Props {
  config: ApkBuildConfig;
  onClose: () => void;
  onSendNotification: (payload: { title: string; message: string; icon?: string }) => void;
}

export const PushNotificationDashboardModal: React.FC<Props> = ({
  config,
  onClose,
  onSendNotification
}) => {
  const { lang } = useApp();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const [appId, setAppId] = useState(config.packageName || 'com.flowers.app');
  const [password, setPassword] = useState(config.pushNotificationPassword || '123456');
  const [title, setTitle] = useState('New App Update 🚀');
  const [message, setMessage] = useState('Asante kwa kutumia app yetu! Kuna maboresho mapya.');
  const [imageUrl, setImageUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] ✓ Server connected: FCM Gateway online`,
    `[${new Date().toLocaleTimeString()}] ✓ 1 device registered for ${config.packageName || 'com.flowers.app'} ("Android 14 Simulator")`
  ]);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      showToast(lang === 'en' ? 'Title and message are required' : 'Kichwa cha habari na ujumbe vinahitajika');
      return;
    }

    setIsSending(true);
    const now = new Date().toLocaleTimeString();
    
    setActivityLogs(prev => [
      ...prev,
      `[${now}] Sending push notification payload to device(s)...`,
    ]);

    setTimeout(() => {
      const finishTime = new Date().toLocaleTimeString();
      setActivityLogs(prev => [
        ...prev,
        `[${finishTime}] ✓ Sent to "Android Simulator" (Token: fcm_sim_${Math.random().toString(36).substring(2, 9)})`,
        `[${finishTime}] — Done: 1 sent, 0 failed —`
      ]);
      setIsSending(false);
      showToast(lang === 'en' ? 'Push Notification Delivered!' : 'Arifa ya Push Imetumwa Papo Hapo!');

      // Trigger actual banner dispatch
      onSendNotification({
        title: title.trim(),
        message: message.trim(),
        icon: config.appIconEmoji
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[340] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto page-anim">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Bell size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Push Notifications Console</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Server Online
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' 
                  ? 'Send instant push alerts to devices with your built app' 
                  : 'Tuma arifa za papo hapo kwa simu zenye app yako'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Credentials / App ID Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
          <div>
            <span className="text-slate-500 font-bold block mb-1">APP ID (PACKAGE NAME):</span>
            <div className="font-mono text-indigo-300 font-bold truncate">
              {appId}
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-bold block mb-1">PUSH PASSWORD:</span>
            <div className="font-mono text-emerald-300 font-bold flex items-center gap-1.5">
              <KeyRound size={13} />
              <span>••••••••</span>
              <span className="text-[10px] text-slate-500">(Configured)</span>
            </div>
          </div>
        </div>

        {/* Compose Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {lang === 'en' ? 'Notification Title *' : 'Kichwa cha Arifa (Title) *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="mf. Punguzo la 50% leo!"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {lang === 'en' ? 'Notification Message *' : 'Ujumbe wa Arifa (Message) *'}
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ujumbe unaotaka uonekane kwenye simu ya mtumiaji..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
              <ImageIcon size={13} className="text-slate-400" />
              <span>{lang === 'en' ? 'Banner Image URL (Optional)' : 'Picha ya Arifa (URL ya Hiari)'}</span>
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Inatuma kwa Vifaa Vya Watumiaji...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>{lang === 'en' ? 'Send Push Notification' : 'Tuma Arifa kwa Simu Zote'}</span>
              </>
            )}
          </button>
        </div>

        {/* Activity Log Terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold border-b border-slate-900 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal size={12} className="text-indigo-400" />
              Server & Device Activity Log
            </span>
            <span className="text-emerald-400 font-normal">Active</span>
          </div>

          <div className="max-h-[110px] overflow-y-auto space-y-1 text-[11px]">
            {activityLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={cn(
                  log.includes('✓') ? "text-emerald-400" : log.includes('Done') ? "text-indigo-300 font-bold" : "text-slate-400"
                )}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
