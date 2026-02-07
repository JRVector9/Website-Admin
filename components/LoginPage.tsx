import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('v9_admin_token', data.token);
        onLogin(data.token);
      } else {
        setError('ACCESS_DENIED: Invalid password');
        setPassword('');
      }
    } catch (err) {
      setError('SYSTEM_ERROR: Cannot connect to auth server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border-2 border-[#ff7043] p-8 shadow-[0_0_60px_rgba(255,112,67,0.2)]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="retro-text text-3xl text-[#ff7043] glow-orange mb-2">
            V9_ADMIN_OS
          </h1>
          <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            Internal_Access_Level: 09
          </div>
          <div className="mt-4 text-xs text-slate-500 font-mono">
            > AUTHENTICATION_REQUIRED
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2">
              ADMIN_PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-slate-700 p-3 text-sm text-white font-mono focus:border-[#ff7043] outline-none transition-colors"
              placeholder="Enter password..."
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 border border-red-900 bg-red-900/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#ff7043] text-black font-bold py-3 text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,112,67,0.3)]"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER_SYSTEM'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[9px] text-slate-600 font-mono uppercase">
          SECURE_SHELL_ACCESS_ONLY
        </div>
      </div>
    </div>
  );
};
