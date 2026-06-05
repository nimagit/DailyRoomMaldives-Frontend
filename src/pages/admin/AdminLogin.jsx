import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Waves, Eye, EyeOff, Loader2, Lock,
  ShieldAlert, Mail, ArrowLeft, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ── 6-box OTP input ──────────────────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const boxes = useRef([]);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[i] = digit;
    onChange(chars.join(''));
    if (digit && i < 5) boxes.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!value[i] && i > 0) {
        boxes.current[i - 1]?.focus();
      } else {
        const chars = value.split('');
        chars[i] = '';
        onChange(chars.join(''));
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) boxes.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    const nextIdx = Math.min(pasted.length, 5);
    setTimeout(() => boxes.current[nextIdx]?.focus(), 0);
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (boxes.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all duration-200 disabled:opacity-50
            ${value[i]
              ? 'border-ocean-500 bg-ocean-50 text-ocean-700 shadow-md shadow-ocean-200'
              : 'border-gray-200 bg-white text-gray-900 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100'
            }`}
        />
      ))}
    </div>
  );
}

/* ── Countdown hook ───────────────────────────────────────────── */
function useCountdown(seconds) {
  const [count, setCount] = useState(seconds);
  const reset = (s = seconds) => setCount(s);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);
  return [count, reset];
}

/* ── Slide variants ───────────────────────────────────────────── */
const slide = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.25 } }),
};

/* ── Main component ───────────────────────────────────────────── */
export default function AdminLogin() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);          // 1 = credentials, 2 = OTP
  const [creds, setCreds] = useState(null);      // { email, password } kept for resend
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendCount, resetCountdown] = useCountdown(60);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPw, setShowPw] = useState(false);

  /* Step 1: submit credentials */
  const handleCredentials = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await login(email, password);
      setCreds({ email, password });
      setMaskedEmail(res.maskedEmail);
      setStep(2);
      toast.success('OTP sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
      setAttempts((a) => a + 1);
    } finally {
      setLoading(false);
    }
  };

  /* Step 2: verify OTP */
  const handleVerifyOtp = async () => {
    if (otp.replace(/\D/g, '').length < 6) {
      setOtpError('Enter all 6 digits');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      await verifyOtp(creds.email, otp);
      toast.success('Login successful!');
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      setOtpError(msg);
      setOtp('');
      if (msg.includes('log in again')) {
        setTimeout(() => { setStep(1); setOtpError(''); }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    if (resendCount > 0 || !creds) return;
    setLoading(true);
    try {
      await login(creds.email, creds.password);
      setOtp('');
      setOtpError('');
      resetCountdown(60);
      toast.success('New OTP sent!');
    } catch {
      toast.error('Failed to resend. Please log in again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="min-h-screen bg-ocean-gradient flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-[480px] h-[480px] bg-teal-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-ocean-400/25 rounded-full blur-3xl"
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-ocean-500 to-ocean-700" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-ocean-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-500/30">
                  <Waves className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Lock className="w-3.5 h-3.5 text-ocean-600" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h1>
              <p className="text-sm text-gray-400 mt-0.5 font-medium">Daily Room Maldives</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s ? 'bg-ocean-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  {s === 1 && (
                    <div className={`w-12 h-1 rounded-full transition-all duration-500 ${step > 1 ? 'bg-ocean-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Animated step content ── */}
            <div className="overflow-hidden relative">
              <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>

                {/* Step 1 — Credentials */}
                {step === 1 && (
                  <motion.div key="step1" custom={-1} variants={slide} initial="initial" animate="animate" exit="exit">
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 mb-5">
                      <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Restricted area. Unauthorized access is prohibited.
                      </p>
                    </div>

                    {attempts >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mb-4"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-600 font-medium">
                          {attempts} failed attempt{attempts > 1 ? 's' : ''} detected.
                        </p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit(handleCredentials)} className="space-y-4" noValidate>
                      <div>
                        <label className="label">Email Address</label>
                        <input
                          type="email"
                          autoComplete="username"
                          autoFocus
                          className={`input ${errors.email ? 'input-error' : ''}`}
                          placeholder="admin@dailyroom.mv"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                          })}
                        />
                        {errors.email && <p className="error-msg">{errors.email.message}</p>}
                      </div>

                      <div>
                        <label className="label">Password</label>
                        <div className="relative">
                          <input
                            type={showPw ? 'text' : 'password'}
                            autoComplete="current-password"
                            className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            {...register('password', { required: 'Password is required' })}
                          />
                          <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="error-msg">{errors.password.message}</p>}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        className="btn-primary w-full py-3.5 text-base justify-center gap-2 rounded-xl mt-1"
                      >
                        {loading
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending OTP…</>
                          : <><Mail className="w-4 h-4" /> Continue with OTP</>
                        }
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* Step 2 — OTP */}
                {step === 2 && (
                  <motion.div key="step2" custom={1} variants={slide} initial="initial" animate="animate" exit="exit">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-5 h-5 text-ocean-600" />
                      </div>
                      <h2 className="font-bold text-gray-900 text-base">Check your email</h2>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        We sent a 6-digit code to<br />
                        <span className="font-semibold text-ocean-700">{maskedEmail}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Expires in 10 minutes</p>
                    </div>

                    {/* 6-box OTP input */}
                    <div className="mb-4">
                      <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {otpError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-4"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-xs text-red-600 font-medium">{otpError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.replace(/\D/g,'').length < 6}
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary w-full py-3.5 text-base justify-center gap-2 rounded-xl mb-3 disabled:opacity-50"
                    >
                      {loading
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</>
                        : <><Lock className="w-4 h-4" /> Verify & Sign In</>
                      }
                    </motion.button>

                    {/* Resend + Back */}
                    <div className="flex items-center justify-between text-sm">
                      <button
                        onClick={goBack}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-ocean-700 transition-colors font-medium"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>

                      <button
                        onClick={handleResend}
                        disabled={resendCount > 0 || loading}
                        className="flex items-center gap-1.5 text-ocean-600 hover:text-ocean-800 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {resendCount > 0 ? `Resend in ${resendCount}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
              © {new Date().getFullYear()} Daily Room Maldives &nbsp;·&nbsp; All activity is logged
            </p>
          </div>
        </motion.div>

        {/* Bottom hint */}
        <p className="text-center text-white/50 text-xs mt-4">
          🔒 &nbsp;Protected admin area — unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
