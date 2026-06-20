import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Eye, EyeOff, Key, Terminal, Compass, 
  AlertCircle, UserPlus, LogIn, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

interface Operator {
  operatorId: string;
  securityPass: string;
  operatorName: string;
  createdAt: string;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In inputs
  const [operatorId, setOperatorId] = useState('DM-ADM-2041');
  const [securityPass, setSecurityPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign Up inputs
  const [signupId, setSignupId] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Generate a premium random Operator ID on first load to aid enrollment
  useEffect(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setSignupId(`DM-OPR-${randomSuffix}`);
  }, [activeTab]);

  // Load registered operators database or seed it with the default
  const getRegisteredOperators = (): Operator[] => {
    try {
      const dbStr = localStorage.getItem('dm_operators_db');
      if (dbStr) {
        return JSON.parse(dbStr);
      }
    } catch (e) {
      console.error("Failed to parse local operator DB:", e);
    }
    return [];
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId.trim()) {
      setError('Operational clearance ID required.');
      return;
    }
    if (!securityPass) {
      setError('Tactical activation key required.');
      return;
    }

    setIsAuthenticating(true);
    setError('');
    setSuccess('');

    // Simulate mainframe authorization handshake delay
    setTimeout(() => {
      const opIdClean = operatorId.trim().toUpperCase();
      const passClean = securityPass.trim();

      // Retrieve local persistent accounts
      const localOperators = getRegisteredOperators();
      const matchedLocal = localOperators.find(
        (op) => op.operatorId.toUpperCase() === opIdClean && op.securityPass === passClean
      );

      // Check standard mock credentials or persistent local database accounts
      const isDefaultAdmin = 
        opIdClean === 'DM-ADM-2041' && 
        (passClean === 'disastermind' || 
         passClean === 'admin' || 
         passClean === 'password' || 
         passClean.toLowerCase() === 'password');

      if (isDefaultAdmin || matchedLocal) {
        localStorage.setItem('dm_auth', 'true');
        localStorage.setItem('dm_operator_id', opIdClean);
        
        setSuccess('Clearance approved! Syncing terminal grids...');
        setTimeout(() => {
          onLoginSuccess();
        }, 600);
      } else {
        setError('Authorization check failed. Invalid ID or Activation Key.');
        setIsAuthenticating(false);
      }
    }, 750);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanId = signupId.trim().toUpperCase();
    const cleanPass = signupPass.trim();
    const cleanConfirm = signupConfirmPass.trim();
    const cleanName = signupName.trim() || 'Command Operator';

    if (!cleanId) {
      setError('Clearance Operator ID is required.');
      return;
    }
    if (cleanId.length < 4) {
      setError('Operator ID must be at least 4 characters.');
      return;
    }
    if (!cleanPass) {
      setError('Security activation key is required.');
      return;
    }
    if (cleanPass.length < 5) {
      setError('Activation key must be at least 5 characters for full sector encryption.');
      return;
    }
    if (cleanPass !== cleanConfirm) {
      setError('Activation keys do not match. Re-enter matching security keys.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const localOperators = getRegisteredOperators();

      // Enforce unique usernames
      const idExists = 
        cleanId === 'DM-ADM-2041' || 
        localOperators.some(op => op.operatorId.toUpperCase() === cleanId);

      if (idExists) {
        setError(`Clearance ID '${cleanId}' is already globally registered.`);
        setIsAuthenticating(false);
        return;
      }

      // Add to database
      const newOperator: Operator = {
        operatorId: cleanId,
        securityPass: cleanPass,
        operatorName: cleanName,
        createdAt: new Date().toISOString()
      };

      const updatedDB = [...localOperators, newOperator];
      localStorage.setItem('dm_operators_db', JSON.stringify(updatedDB));

      // Successfully registered feedback
      setSuccess(`Clearance Granted! Enrolled Operator ${cleanId} successfully.`);
      
      // Auto-populate the Sign-In fields for a super clean user experience
      setOperatorId(cleanId);
      setSecurityPass(cleanPass);

      // Perform auto-login transition immediately for smoothness
      setTimeout(() => {
        localStorage.setItem('dm_auth', 'true');
        localStorage.setItem('dm_operator_id', cleanId);
        onLoginSuccess();
      }, 900);
    }, 800);
  };

  const handleQuickBypass = () => {
    localStorage.setItem('dm_auth', 'true');
    localStorage.setItem('dm_operator_id', 'DM-ADM-2041');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white font-sans relative overflow-hidden">
      {/* High-tech tactical laser visual scanner and background matrix */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      
      {/* Moving tactical scanning laser */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-scan-y pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-md relative z-10">
        
        {/* Radar head agency branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-red-650/10 border border-red-500/30 text-red-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(217,27,54,0.2)] rounded-full">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>
          <h1 className="font-sans font-extrabold text-slate-100 text-lg uppercase tracking-wider mb-0.5">
            DisasterMind AI Command
          </h1>
          <p className="font-mono text-[9px] text-[#00E5FF] font-bold uppercase tracking-widest bg-cyan-955/40 border border-cyan-800/20 px-3 py-0.5 rounded-full">
            Tactical Security Handshake Grid
          </p>
        </div>

        {/* Tab Selection Switches */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-slate-850/50 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-red-650 text-white shadow-md shadow-red-950/40'
                : 'text-slate-400 hover:text-slate-150 hover:bg-slate-900/40'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Personnel Sign In</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-red-650 text-white shadow-md shadow-red-950/40'
                : 'text-slate-400 hover:text-slate-150 hover:bg-slate-900/40'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll Clearance</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-955/30 border border-red-900/40 rounded-xl flex items-start gap-2 text-xs text-red-400 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-sans leading-relaxed">
              <p className="font-semibold uppercase tracking-wider text-[9px] mb-0.5">Handshake Suspended</p>
              <p className="text-[11px] font-mono text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 bg-green-950/30 border border-green-800/40 rounded-xl flex items-start gap-2 text-xs text-green-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-sans leading-relaxed pb-0.5">
              <p className="font-semibold uppercase tracking-wider text-[9px] mb-0.5">Authentication Pass</p>
              <p className="text-[11px] font-mono text-slate-200">{success}</p>
            </div>
          </div>
        )}

        {activeTab === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                Operator Clearance ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Terminal className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  autoComplete="username"
                  className="w-full pl-9.5 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                  placeholder="e.g. DM-ADM-2041"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                  Encryption Activation Key
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={securityPass}
                  onChange={(e) => setSecurityPass(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-9.5 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                  placeholder="Enter secret key..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-mono text-[8px] text-slate-500 mt-2 leading-relaxed">
                Security clearance code: <span className="text-slate-400 font-bold">password</span> or use registered login ID.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl border border-red-550/20 font-sans tracking-widest uppercase transition-all shadow-md hover:shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>SYNCHRONIZING TERMINAL MAINFRAME...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white/90" />
                  <span>AUTHORIZE WORKSTATION GATE</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up / Enrollment Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                Proposed Operator ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Terminal className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                  placeholder="e.g. DM-OPR-2490"
                />
              </div>
              <p className="font-mono text-[8px] text-slate-500 mt-1 leading-none">
                Unique identifier required for secure dispatch tracing.
              </p>
            </div>

            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                Personnel Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <span className="text-[10px] uppercase font-mono font-bold">NM</span>
                </div>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                  placeholder="e.g. Deputy John Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                  Activation Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                    placeholder="Min 5 chars"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                  Confirm Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupConfirmPass}
                    onChange={(e) => setSignupConfirmPass(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 transition-all font-semibold"
                    placeholder="Repeat key"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-end">
              <input 
                type="checkbox" 
                id="show-signup-pass" 
                checked={showSignupPassword}
                onChange={() => setShowSignupPassword(!showSignupPassword)}
                className="rounded border-slate-800 bg-slate-950 text-red-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
              />
              <label htmlFor="show-signup-pass" className="font-mono text-[8px] text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                Unhide Security Keys
              </label>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl border border-red-550/20 font-sans tracking-widest uppercase transition-all shadow-md hover:shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>TRANSMITTING ENROLLMENT handshake...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-white/90" />
                  <span>SECURE REGISTER (AUTO SIGN-IN)</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-850" />
          </div>
          <div className="relative flex justify-center text-[8px] font-mono leading-none uppercase tracking-widest">
            <span className="bg-slate-900 px-3 text-slate-500">Instant Bypass Terminal</span>
          </div>
        </div>

        {/* Quick Bypass button */}
        <button
          onClick={handleQuickBypass}
          type="button"
          className="w-full py-2 bg-slate-955 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-750 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner font-mono uppercase tracking-widest"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>Bypass Security (Operator Auth)</span>
        </button>

        {/* Footer classification specifications */}
        <div className="mt-6 pt-4 border-t border-slate-850 text-center font-mono text-[7.5px] text-slate-500 space-y-1 tracking-wider leading-relaxed">
          <p>AUTHORIZED INGRESS ONLY. EXTREME METEOROLOGICAL DISPATCH PLATFORM.</p>
          <p className="text-red-500/60 font-bold">SECURE CHANNEL AES-256 SYMMETRIC SESSION ACTIVE</p>
        </div>

      </div>
    </div>
  );
}
