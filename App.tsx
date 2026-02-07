import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { SiteConfig } from './types';

const DEFAULT_CONFIG: SiteConfig = {
  companyName: 'VECTOR NINE',
  slogan: '비전에 정확한 방향을 더하다',
  subLabel: '/// ENGINEERING_COLLECTIVE_V9 ///',
  terminalTitle: 'Main_Console.sh',
  welcomeMessage: 'WELCOME TO VECTOR NINE CONSOLE.',
  inquiryBtnText: '[!] START_INQUIRY',
  adminBtnText: 'ADMIN',
  metricsTitle: 'SYSTEM_METRICS.DAT',
  modulesTitle: 'ENGINEERING_MODULES',
  missionTitle: 'MISSION_CONTROL.LOG',
  missionMainText: 'focuses on deep-tech engineering and high-availability architecture.',
  missionQuote: '비전에 정확한 방향을 더하다',
  missionSubText: '우리는 단순한 코드 작성을 넘어, 비즈니스가 나아가야 할 최적의 궤적을 설계합니다.',
  footerText: '(C) 2024 VECTOR NINE. RAW_ENGINEERING_COLLECTIVE.'
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem('v9_site_config');
    if (savedConfig) {
      setSiteConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
    }

    // Check for existing token
    const token = localStorage.getItem('v9_admin_token');
    if (token) {
      // Simple token validation (check if not expired)
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1] || '{}'));
        const now = Date.now() / 1000;
        if (tokenData.exp && tokenData.exp > now) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem('v9_admin_token');
        }
      } catch {
        localStorage.removeItem('v9_admin_token');
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('v9_admin_token');
    setAuthenticated(false);
  };

  const handleConfigChange = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
        <div className="text-[#ff7043] retro-text text-2xl glow-orange animate-pulse">
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AdminPanel
      onClose={handleLogout}
      onConfigChange={handleConfigChange}
      currentConfig={siteConfig}
    />
  );
};

export default App;
