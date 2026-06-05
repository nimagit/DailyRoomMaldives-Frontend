import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

function ViberIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.5 1C5.71 1 1 5.54 1 11.12c0 3.12 1.47 6.05 4 7.98v3.9l3.72-2.08c.89.24 1.83.36 2.78.36 5.79 0 10.5-4.54 10.5-10.12S17.29 1 11.5 1zm4.6 14.56c-.3.8-1.49 1.47-2.38 1.57-.6.07-1.36.1-2.19-.12-2.38-.67-4.56-2.55-5.77-4.76-.59-1.06-.9-2.04-.9-3.01 0-1.17.37-2.15 1.09-2.78.4-.35.83-.52 1.23-.52.47 0 .88.28 1.16.76l1.29 2.21c.28.48.1 1.08-.42 1.37l-.67.46c.78 1.37 1.96 2.52 3.37 3.14l.47-.68c.37-.53.97-.62 1.47-.3l2.14 1.3c.48.29.68.87.5 1.38l-.19.02z"/>
    </svg>
  );
}

function buildViberUrl(number) {
  let cleaned = number.replace(/[\s\-().]/g, '');
  if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
  return `viber://chat?number=${encodeURIComponent(cleaned)}`;
}

function FallbackToast({ number, toastId }) {
  const copy = () => {
    navigator.clipboard.writeText(number).then(() => {
      toast.success('Number copied!');
      toast.dismiss(toastId);
    });
  };

  return (
    <div className="flex flex-col gap-2.5 min-w-[220px]">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#7360F2' }}>
          <ViberIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Viber not installed?</p>
          <p className="text-xs text-gray-500">Copy the number &amp; open Viber manually</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
        <span className="text-sm font-mono font-bold text-gray-800 flex-1">{number}</span>
        <button
          onClick={copy}
          className="text-xs font-bold text-white px-2.5 py-1 rounded-lg flex-shrink-0"
          style={{ background: '#7360F2' }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

/**
 * Opens Viber app via deep link. If Viber is not installed,
 * shows a toast with the number and a copy button.
 *
 * Props:
 *  number     – phone number (e.g. "+9607771234")
 *  className  – button class
 *  size       – "sm" (card) or "lg" (detail page)
 *  stopProp   – whether to call e.stopPropagation() (for use inside Link cards)
 */
export default function ViberButton({ number, className, size = 'sm', stopProp = false }) {
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = (e) => {
    e.preventDefault();
    if (stopProp) e.stopPropagation();

    const url = buildViberUrl(number);
    window.location.href = url;

    // If Viber opens, the tab becomes hidden — cancel the fallback
    const onHide = () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onHide);
    };
    document.addEventListener('visibilitychange', onHide);

    // If still visible after 1.8s → Viber not installed → show fallback
    timerRef.current = setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      const id = 'viber-fallback';
      toast.dismiss(id);
      toast((t) => <FallbackToast number={number} toastId={t.id} />, {
        id,
        duration: 9000,
        style: { borderRadius: '14px', padding: '12px 14px' },
      });
    }, 1800);
  };

  if (size === 'lg') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2.5 w-full text-base py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:opacity-90 active:scale-95 ${className ?? ''}`}
        style={{ background: '#7360F2' }}
      >
        <ViberIcon className="w-5 h-5" />
        Chat on Viber
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:opacity-90 ${className ?? ''}`}
      style={{ background: '#7360F2' }}
      title="Open in Viber"
    >
      <ViberIcon className="w-3.5 h-3.5" />
      Viber
    </button>
  );
}
