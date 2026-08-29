import React from 'react';
import { useApp } from '../contexts/AppContext';
import { X, Award, Share2, Download } from 'lucide-react';
import { getInitials } from '../lib/utils';

export const CertificateOverlay: React.FC<{ title: string; score: number; onClose: () => void }> = ({ title, score, onClose }) => {
  const { profile, user, lang } = useApp();
  const name = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="fixed inset-0 z-[250] bg-black/90 flex items-center justify-center p-6 page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-black shadow-2xl overflow-hidden border-[8px] border-gold">
        {/* Ornate corner */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold rounded-full opacity-20" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary rounded-full opacity-10" />

        <div className="flex flex-col items-center text-center space-y-6">
          <Award className="text-gold w-16 h-16" />
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-poppins text-primary uppercase tracking-tighter">Certificate</h2>
            <p className="text-[10px] font-bold text-text3 tracking-[4px] uppercase">of achievement</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-text3 italic">This is to certify that</p>
            <h3 className="text-xl font-bold border-b-2 border-theme px-4 pb-1 inline-block text-slate-800">{name}</h3>
          </div>

          <div className="space-y-1 px-4">
            <p className="text-xs text-text3">has successfully completed</p>
            <h4 className="font-bold text-sm text-slate-700">{title}</h4>
            <div className="text-primary font-black text-xl mt-2">{score}% SCORE</div>
          </div>

          <div className="pt-4 flex items-center justify-between w-full border-t border-theme">
             <div className="text-left">
                <p className="text-[10px] text-text3 uppercase font-bold">Authorized By</p>
                <div className="font-poppins text-sm font-bold text-primary italic">CodZnz Pro CEO</div>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-text3 uppercase font-bold">Date</p>
                <div className="font-mono text-xs text-slate-600">{new Date().toLocaleDateString()}</div>
             </div>
          </div>
          
          <div className="flex gap-2 w-full">
            <button className="flex-1 h-10 bg-bg3 text-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-bold">
               <Download size={14} /> Download
            </button>
            <button className="flex-1 h-10 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold">
               <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white">
        <X size={32} />
      </button>
    </div>
  );
};
