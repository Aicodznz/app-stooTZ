import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Globe, 
  Folder, 
  Layers, 
  ShieldCheck, 
  Bell, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Code2,
  Palette,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ApkBuildConfig, UserSubscriptionPlan } from '../../types';
import { cn } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';

interface Props {
  initialAppName?: string;
  onClose: () => void;
  onStartBuild: (config: ApkBuildConfig) => void;
  onOpenPlans: (featureName?: string) => void;
  activePlan: UserSubscriptionPlan;
}

export const BuildApkModal: React.FC<Props> = ({
  initialAppName = 'Flowers',
  onClose,
  onStartBuild,
  onOpenPlans,
  activePlan
}) => {
  const { lang } = useApp();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const [targetTab, setTargetTab] = useState<'web' | 'native'>('web');
  
  // App Information State
  const [appName, setAppName] = useState(initialAppName);
  const [packageName, setPackageName] = useState(() => {
    const clean = initialAppName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myapp';
    return `com.${clean}.app`;
  });
  const [appSource, setAppSource] = useState<'projects' | 'url'>('projects');
  const [websiteUrl, setWebsiteUrl] = useState('https://');
  const [versionName, setVersionName] = useState('1.0');
  const [versionCode, setVersionCode] = useState(1);

  // Icon & Branding State
  const [appIconEmoji, setAppIconEmoji] = useState('🌸');
  const [appIconBg, setAppIconBg] = useState('#6366f1');
  const [statusBarColor, setStatusBarColor] = useState('#2563eb');
  const [splashScreenColor, setSplashScreenColor] = useState('#0f172a');

  // Behavior State
  const [hideTitleBar, setHideTitleBar] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [exitConfirmation, setExitConfirmation] = useState(true);

  // Interaction State
  const [pullToRefresh, setPullToRefresh] = useState(true);
  const [pinchZoom, setPinchZoom] = useState(false);
  const [mediaAutoplay, setMediaAutoplay] = useState(true);
  const [pcMode, setPcMode] = useState(false);
  const [longPressMenu, setLongPressMenu] = useState(false);

  // Permissions State
  const [cameraAccess, setCameraAccess] = useState(false);
  const [microphone, setMicrophone] = useState(false);

  // Appearance State
  const [darkModeSupport, setDarkModeSupport] = useState(true);
  const [darkModeStatusBarColor, setDarkModeStatusBarColor] = useState('#090d16');

  // Pro Features State
  const [aes256Encryption, setAes256Encryption] = useState(true);
  const [pushNotificationsFCM, setPushNotificationsFCM] = useState(true);
  const [pushNotificationPassword, setPushNotificationPassword] = useState('123456');
  const [showPushPassword, setShowPushPassword] = useState(false);
  const [showPushFaq, setShowPushFaq] = useState(false);
  const [admobAds, setAdmobAds] = useState(false);
  const [bannerAdUnitId, setBannerAdUnitId] = useState('ca-app-pub-3940256099942544/6300978111');
  const [interstitialAdUnitId, setInterstitialAdUnitId] = useState('ca-app-pub-3940256099942544/1033173712');

  // Share & Rate State
  const [shareMessage, setShareMessage] = useState('Angalia app hii nzuri niliyotengeneza kwenye Wevlo Studio!');
  const [shareLink, setShareLink] = useState('');

  // Advanced State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');

  // Handle auto package name on app name change
  const handleAppNameChange = (name: string) => {
    setAppName(name);
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app';
    setPackageName(`com.${clean}.app`);
  };

  const handleToggleProFeature = (feature: 'encryption' | 'fcm' | 'admob', currentValue: boolean, setter: (val: boolean) => void) => {
    if (!currentValue && !activePlan.isActive) {
      onOpenPlans(feature === 'encryption' ? 'AES-256 Encryption' : feature === 'fcm' ? 'Push Notifications' : 'AdMob Monetization');
      return;
    }
    setter(!currentValue);
  };

  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      showToast(lang === 'en' ? 'App Name is required' : 'Jina la App linahitajika');
      return;
    }

    const config: ApkBuildConfig = {
      appName: appName.trim(),
      packageName: packageName.trim() || 'com.app.default',
      versionName: versionName.trim() || '1.0',
      versionCode: Number(versionCode) || 1,
      appSource,
      websiteUrl: appSource === 'url' ? websiteUrl : undefined,
      selectedProject: appName,
      appIconEmoji,
      appIconBg,
      statusBarColor,
      splashScreenColor,
      hideTitleBar,
      loadingSpinner,
      fullscreen,
      exitConfirmation,
      pullToRefresh,
      pinchZoom,
      mediaAutoplay,
      pcMode,
      longPressMenu,
      cameraAccess,
      microphone,
      darkModeSupport,
      darkModeStatusBarColor,
      aes256Encryption,
      pushNotificationsFCM,
      pushNotificationPassword,
      admobAds,
      bannerAdUnitId: admobAds ? bannerAdUnitId : undefined,
      interstitialAdUnitId: admobAds ? interstitialAdUnitId : undefined,
      shareMessage,
      shareLink,
      customCss,
      customJs
    };

    onStartBuild(config);
  };

  const iconEmojis = ['🌸', '💻', '⚡', '📱', '🚀', '🔥', '📚', '🎯', '🛒', '🎮', '💡', '🌟'];
  const statusColors = ['#2563eb', '#6366f1', '#059669', '#d97706', '#dc2626', '#090d16', '#7c3aed'];

  return (
    <div className="fixed inset-0 z-[310] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto page-anim">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Zap size={22} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Build APK</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Android Studio Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' 
                  ? 'Convert your project into a signed standalone Android APK file' 
                  : 'Badilisha msimbo wako kuwa faili la APK lililotayarishwa kusakinishwa kwenye Android'}
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

        {/* Builder Language Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTargetTab('web')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              targetTab === 'web' 
                ? "bg-gradient-to-r from-indigo-600 to-primary text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Globe size={15} />
            <span>HTML / CSS / JS (Web-to-APK)</span>
          </button>
          <button
            onClick={() => setTargetTab('native')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              targetTab === 'native' 
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Code2 size={15} />
            <span>Kotlin / Java / PyScript</span>
          </button>
        </div>

        {/* Builder Form */}
        <form onSubmit={handleBuild} className="space-y-6">
          
          {/* SECTION 1: APP INFORMATION */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <span>1. App Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  APP NAME *
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={e => handleAppNameChange(e.target.value)}
                  placeholder="e.g. Flowers"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  PACKAGE NAME *
                </label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={e => setPackageName(e.target.value)}
                  placeholder="com.flowers.app"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Lowercase, dot-separated (e.g. com.company.app)
                </span>
              </div>
            </div>

            {/* App Source Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                APP SOURCE *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAppSource('projects')}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2",
                    appSource === 'projects'
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Folder size={14} />
                  <span>My Projects (Current Code)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppSource('url')}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2",
                    appSource === 'url'
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Globe size={14} />
                  <span>Website URL</span>
                </button>
              </div>

              {appSource === 'url' ? (
                <div className="mt-3">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check size={13} />
                  <span>✓ Current Sandbox Code files are ready to package</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  VERSION NAME
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={e => setVersionName(e.target.value)}
                  placeholder="1.0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  VERSION CODE
                </label>
                <input
                  type="number"
                  value={versionCode}
                  onChange={e => setVersionCode(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ICON & BRANDING */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Palette size={14} />
              <span>2. Icon & Branding</span>
            </h4>

            {/* Icon Picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 shrink-0"
                style={{ backgroundColor: appIconBg }}
              >
                {appIconEmoji}
              </div>

              <div className="flex-1 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">CHOOSE APP ICON:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {iconEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAppIconEmoji(emoji)}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all",
                        appIconEmoji === emoji 
                          ? "bg-indigo-600 ring-2 ring-indigo-400 scale-110" 
                          : "bg-slate-900 hover:bg-slate-800"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  STATUS BAR COLOR
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={statusBarColor}
                    onChange={e => setStatusBarColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={statusBarColor}
                    onChange={e => setStatusBarColor(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  SPLASH SCREEN COLOR
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={splashScreenColor}
                    onChange={e => setSplashScreenColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={splashScreenColor}
                    onChange={e => setSplashScreenColor(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BEHAVIOR & PERMISSIONS */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} />
              <span>3. Behavior & Permissions</span>
            </h4>

            {/* Behavior Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Hide Title Bar', desc: 'Hides the top toolbar in app', state: hideTitleBar, set: setHideTitleBar },
                { label: 'Loading Spinner', desc: 'Shows spinner while loading', state: loadingSpinner, set: setLoadingSpinner },
                { label: 'Fullscreen Mode', desc: 'Hides phone status bar', state: fullscreen, set: setFullscreen },
                { label: 'Exit Confirmation', desc: 'Press back twice to exit', state: exitConfirmation, set: setExitConfirmation },
                { label: 'Pull to Refresh', desc: 'Allows swipe down to reload', state: pullToRefresh, set: setPullToRefresh },
                { label: 'Dark Mode Support', desc: 'Adapts to phone system theme', state: darkModeSupport, set: setDarkModeSupport },
                { label: 'Camera Access', desc: 'Adds camera hardware permission', state: cameraAccess, set: setCameraAccess },
                { label: 'Microphone Access', desc: 'Adds audio record permission', state: microphone, set: setMicrophone },
              ].map((sw, idx) => (
                <div 
                  key={idx} 
                  onClick={() => sw.set(!sw.state)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    sw.state ? "bg-indigo-600/10 border-indigo-500/50" : "bg-slate-900/60 border-slate-800"
                  )}
                >
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">{sw.label}</span>
                    <span className="text-[10px] text-slate-400">{sw.desc}</span>
                  </div>
                  <div className={cn(
                    "w-9 h-5 rounded-full transition-colors relative shrink-0",
                    sw.state ? "bg-indigo-600" : "bg-slate-700"
                  )}>
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5",
                      sw.state ? "left-5" : "left-0.5"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: PRO FEATURES (PRO) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} />
                <span>4. Pro Features (PRO)</span>
              </h4>
              <button
                type="button"
                onClick={() => onOpenPlans()}
                className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Plans</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* AES-256 Encryption */}
              <div 
                onClick={() => handleToggleProFeature('encryption', aes256Encryption, setAes256Encryption)}
                className={cn(
                  "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                  aes256Encryption ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-900 border-slate-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>AES-256 Asset Encryption</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">PRO</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Protects your HTML/JS code from being decompiled</span>
                  </div>
                </div>

                <div className={cn(
                  "w-9 h-5 rounded-full transition-colors relative shrink-0",
                  aes256Encryption ? "bg-amber-500" : "bg-slate-700"
                )}>
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5",
                    aes256Encryption ? "left-5" : "left-0.5"
                  )} />
                </div>
              </div>

              {/* Push Notifications (FCM) */}
              <div className="p-3.5 rounded-xl border bg-slate-900 border-slate-800 space-y-3">
                <div 
                  onClick={() => handleToggleProFeature('fcm', pushNotificationsFCM, setPushNotificationsFCM)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell size={18} className="text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Push Notifications (FCM)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">PRO</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Send instant push notifications from the dashboard</span>
                    </div>
                  </div>

                  <div className={cn(
                    "w-9 h-5 rounded-full transition-colors relative shrink-0",
                    pushNotificationsFCM ? "bg-indigo-600" : "bg-slate-700"
                  )}>
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5",
                      pushNotificationsFCM ? "left-5" : "left-0.5"
                    )} />
                  </div>
                </div>

                {/* Expanded FCM Settings if enabled */}
                {pushNotificationsFCM && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        PUSH NOTIFICATION PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showPushPassword ? "text" : "password"}
                          value={pushNotificationPassword}
                          onChange={e => setPushNotificationPassword(e.target.value)}
                          placeholder="Enter password (min 6 chars)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white pr-9 outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPushPassword(!showPushPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPushPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* How does it work info box */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="font-bold text-slate-300 flex items-center gap-1">
                        <HelpCircle size={12} className="text-indigo-400" />
                        <span>How does it work?</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                        <li>FCM config will be automatically injected into your APK bundle.</li>
                        <li>When users open the app, their device registers to receive push alerts.</li>
                        <li>Login to the Push Dashboard with your App ID + Password to dispatch alerts.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* AdMob Ads */}
              <div className="p-3.5 rounded-xl border bg-slate-900 border-slate-800 space-y-3">
                <div 
                  onClick={() => handleToggleProFeature('admob', admobAds, setAdmobAds)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign size={18} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>AdMob Ads (Banner + Interstitial)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">PRO</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Monetize your Android app with Google AdMob</span>
                    </div>
                  </div>

                  <div className={cn(
                    "w-9 h-5 rounded-full transition-colors relative shrink-0",
                    admobAds ? "bg-emerald-600" : "bg-slate-700"
                  )}>
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5",
                      admobAds ? "left-5" : "left-0.5"
                    )} />
                  </div>
                </div>

                {admobAds && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">BANNER AD UNIT ID:</label>
                      <input
                        type="text"
                        value={bannerAdUnitId}
                        onChange={e => setBannerAdUnitId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">INTERSTITIAL AD UNIT ID:</label>
                      <input
                        type="text"
                        value={interstitialAdUnitId}
                        onChange={e => setInterstitialAdUnitId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY CARD AT BOTTOM (Screenshots 9-10) */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-white/20"
                style={{ backgroundColor: appIconBg }}
              >
                {appIconEmoji}
              </div>
              <div>
                <h5 className="text-sm font-black text-white">{appName || 'My App'}</h5>
                <p className="text-[11px] font-mono text-indigo-300">{packageName}</p>
                <p className="text-[10px] text-slate-400">
                  Version {versionName} • Android 5.0+ Min SDK • ~10.2 MB Size
                </p>
              </div>
            </div>

            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hidden sm:inline-block">
              ✓ Ready to Build
            </span>
          </div>

          {/* BUILD APK BUTTON */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 active:scale-95 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase"
          >
            <Zap size={18} className="fill-slate-950 text-slate-950" />
            <span>⚡ BUILD APK</span>
          </button>

        </form>

      </div>
    </div>
  );
};
