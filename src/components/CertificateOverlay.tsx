import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { X, Award, Share2, Download, CheckCircle2, ShieldCheck, QrCode, Sparkles, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const CertificateOverlay: React.FC<{ title: string; score: number; onClose: () => void }> = ({ title, score, onClose }) => {
  const { profile, user, lang, siteSettings } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const studentName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Mwanafunzi Bora';
  const serialNo = `TZ-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = new Date().toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const platformName = siteSettings?.siteName || 'Amourcodes';

  const downloadPDFCertificate = () => {
    setDownloading(true);
    try {
      // Create A4 Landscape PDF (297mm x 210mm)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 297;
      const pageHeight = 210;

      // 1. Background Fill
      doc.setFillColor(252, 253, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // 2. Outer Border (Deep Navy Indigo)
      doc.setDrawColor(30, 27, 75); // Indigo 950
      doc.setLineWidth(5);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

      // 3. Inner Gold Border
      doc.setDrawColor(217, 119, 6); // Amber 600 Gold
      doc.setLineWidth(1.5);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

      // 4. Subtle Corner Accents
      doc.setFillColor(245, 158, 11);
      doc.circle(12, 12, 3, 'F');
      doc.circle(pageWidth - 12, 12, 3, 'F');
      doc.circle(12, pageHeight - 12, 3, 'F');
      doc.circle(pageWidth - 12, pageHeight - 12, 3, 'F');

      // 5. Header / Brand
      doc.setTextColor(79, 70, 229); // Primary Indigo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(platformName.toUpperCase(), pageWidth / 2, 32, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('TANZANIA CODE ACADEMY & SOFTWARE ACCREDITATION', pageWidth / 2, 38, { align: 'center' });

      // 6. Certificate Title
      doc.setFontSize(30);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 54, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.text('CHETI RASMI CHA KUHITIMU NA KUFANYA VIZURI KWA VITENDO', pageWidth / 2, 61, { align: 'center' });

      // 7. Recipient Introduction
      doc.setFontSize(13);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text('Cheti hiki kinatolewa rasmi kwa heshima kwa:', pageWidth / 2, 76, { align: 'center' });

      // 8. Student Name
      doc.setFontSize(28);
      doc.setTextColor(30, 27, 75); // Deep Indigo
      doc.setFont('helvetica', 'bold');
      doc.text(studentName.toUpperCase(), pageWidth / 2, 92, { align: 'center' });

      // Decorative Line under name
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 60, 96, pageWidth / 2 + 60, 96);

      // 9. Completion Text & Course Title
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text('Kwa kufaulu mtihani na kukamilisha kwa vitendo mtaala wa:', pageWidth / 2, 108, { align: 'center' });

      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.setFont('helvetica', 'bold');
      doc.text(`"${title}"`, pageWidth / 2, 120, { align: 'center' });

      // 10. Grade / Score Badge
      const grade = score >= 90 ? 'DISTINCTION (BORA SANA)' : score >= 75 ? 'EXCELLENT (VIZURI SANA)' : 'CREDIT (AMEFAULU)';
      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.roundedRect(pageWidth / 2 - 45, 127, 90, 11, 3, 3, 'F');
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.roundedRect(pageWidth / 2 - 45, 127, 90, 11, 3, 3, 'D');

      doc.setFontSize(10);
      doc.setTextColor(67, 56, 202);
      doc.setFont('helvetica', 'bold');
      doc.text(`ALAMA: ${score}%  |  DARAJA: ${grade}`, pageWidth / 2, 134, { align: 'center' });

      // 11. Signatures & Seals
      const footerY = 168;

      // Left Signature: Lead Instructor
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);
      doc.line(35, footerY, 95, footerY);
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Mwalimu Mkuu wa Mafunzo', 65, footerY + 5, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('CodZnz Tech Academy', 65, footerY + 9, { align: 'center' });

      // Center Seal
      doc.setFillColor(245, 158, 11);
      doc.circle(pageWidth / 2, footerY - 5, 14, 'F');
      doc.setFillColor(254, 243, 199);
      doc.circle(pageWidth / 2, footerY - 5, 11.5, 'F');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.text('VERIFIED', pageWidth / 2, footerY - 7, { align: 'center' });
      doc.text('SEAL 2026', pageWidth / 2, footerY - 3, { align: 'center' });

      // Right Signature: Platform Director / CEO
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 95, footerY, pageWidth - 35, footerY);
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Mkurugenzi Mtendaji (CEO)', pageWidth - 65, footerY + 5, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('CodZnz Platform Zanzibar', pageWidth - 65, footerY + 9, { align: 'center' });

      // 12. Bottom Serial and Verification
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nambari ya Cheti: ${serialNo}`, 20, pageHeight - 16);
      doc.text(`Tarehe ya Kutolewa: ${issueDate}`, pageWidth / 2, pageHeight - 16, { align: 'center' });
      doc.text(`Kagua Mtandaoni: codznz.com/verify/${serialNo.toLowerCase()}`, pageWidth - 20, pageHeight - 16, { align: 'right' });

      // Save PDF file
      const fileName = `Cheti_${studentName.replace(/\s+/g, '_')}_${title.slice(0, 15).replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('PDF Generation error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const shareText = `Nimehitimu mafunzo ya "${title}" kwa alama ya ${score}% kwenye ${platformName}! 🎓🚀 Cheti Namba: ${serialNo}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-8 text-white shadow-2xl overflow-hidden my-auto space-y-6">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{lang === 'en' ? 'Verified Course Certificate' : 'Cheti Rasmi cha Mafunzo'}</h3>
              <p className="text-[10px] text-slate-400">ID: {serialNo}</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Certificate Visual Canvas Preview */}
        <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-inner">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} />
            <span>{platformName} Official Verification</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white uppercase">
              {lang === 'en' ? 'Certificate of Achievement' : 'Cheti cha Kuhitimu na Ufaulu'}
            </h2>
            <p className="text-xs text-slate-400 italic">
              {lang === 'en' ? 'This is proudly presented to' : 'Cheti hiki kinatolewa kwa heshima kwa'}
            </p>
          </div>

          <div className="py-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight font-heading border-b-2 border-amber-500/40 pb-1 px-4 inline-block">
              {studentName}
            </span>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-xs text-slate-300">
              {lang === 'en' ? 'for successfully completing and mastering' : 'kwa kukamilisha kwa mafanikio mtaala wa mafunzo ya'}
            </p>
            <h4 className="text-base sm:text-lg font-black text-primary bg-primary/10 py-1.5 px-3 rounded-xl border border-primary/20">
              {title}
            </h4>
          </div>

          <div className="inline-flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{lang === 'en' ? 'Final Score' : 'Alama'}</span>
              <span className="text-emerald-400 font-black text-sm">{score}%</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{lang === 'en' ? 'Issued Date' : 'Tarehe'}</span>
              <span className="text-slate-200 font-bold">{issueDate}</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck size={14} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={downloadPDFCertificate}
            disabled={downloading}
            className="w-full sm:flex-1 h-12 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:opacity-90 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download size={16} />
            <span>{downloading ? (lang === 'en' ? 'Generating High-Res PDF...' : 'Inatengeneza PDF...') : (lang === 'en' ? 'Download Official PDF' : 'Pakua Cheti kama PDF')}</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto h-12 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            <span>{copied ? (lang === 'en' ? 'Link Copied!' : 'Imenakiliwa!') : (lang === 'en' ? 'Share' : 'Shiriki')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

