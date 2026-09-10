import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Item, Room } from '../types';
import { Printer, X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface BoxLabelModalProps {
  containerName: string;
  containerCode?: string;
  roomName: string;
  items: Item[];
  isOpen: boolean;
  onClose: () => void;
}

export const BoxLabelModal: React.FC<BoxLabelModalProps> = ({
  containerName,
  containerCode,
  roomName,
  items,
  isOpen,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const effectiveCode = containerCode || `BOX-${roomName.slice(0, 3).toUpperCase()}-${Math.abs(containerName.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 4)}`;

  useEffect(() => {
    if (!isOpen) return;
    
    // QR code content: text summary and deep-search payload
    const qrContent = `${language === 'hr' ? 'SPREMLJENO' : 'STORED'}:\n${language === 'hr' ? 'Kutija' : 'Box'}: ${containerName}\n${language === 'hr' ? 'Prostorija' : 'Room'}: ${roomName}\n${language === 'hr' ? 'Kod' : 'Code'}: ${effectiveCode}\n${language === 'hr' ? 'Sadržaj' : 'Contents'} (${items.length}):\n${items.map((it, idx) => `${idx + 1}. ${it.name} (x${it.quantity})`).join('\n')}`;

    QRCode.toDataURL(qrContent, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code', err));
  }, [isOpen, containerName, roomName, effectiveCode, items, language]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `📦 ${containerName} (${roomName})\n${language === 'hr' ? 'Kod' : 'Code'}: ${effectiveCode}\n\n${language === 'hr' ? 'Sadržaj predmeta' : 'Contents'}:\n${items.map(it => `• ${it.name} (${it.quantity} ${language === 'hr' ? 'kom.' : 'pcs'}) - ${it.category}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{t.boxLabelModal.title}</h3>
            <p className="text-xs text-slate-500">{t.boxLabelModal.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="p-6">
          <div 
            ref={printRef}
            className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 print:border-slate-800 print:bg-white"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-200 rounded-md mb-2">
                  {roomName}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{containerName}</h2>
                <p className="text-xs font-mono font-medium text-slate-500 mt-1">
                  ID: {effectiveCode}
                </p>
              </div>

              {qrDataUrl && (
                <div className="shrink-0 bg-white p-2 border border-slate-200 rounded-lg shadow-xs">
                  <img src={qrDataUrl} alt="QR code" className="w-24 h-24" />
                  <p className="text-[10px] text-center text-slate-400 font-mono mt-1">{t.boxLabelModal.scanToView}</p>
                </div>
              )}
            </div>

            {/* Contents list */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t.boxLabelModal.contentsHeading} ({items.length} {items.length === 1 ? t.locations.itemsCountUnit : t.finder.itemCountPlural}):
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic">{t.boxLabelModal.emptyBox}</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <li key={it.id} className="text-xs flex items-center justify-between text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-100">
                      <span className="font-medium text-slate-800 truncate mr-2">{it.name}</span>
                      <span className="text-slate-500 shrink-0 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                        x{it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[11px] text-slate-400 font-medium">
              <span>{t.appTitle}</span>
              <span>{new Date().toLocaleDateString(language === 'hr' ? 'hr-HR' : 'en-US')}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.boxLabelModal.copied : t.boxLabelModal.copySummaryBtn}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.boxLabelModal.printBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
