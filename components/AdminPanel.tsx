
import React, { useState, useEffect } from 'react';
import { Inquiry, SiteConfig } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onConfigChange: (config: SiteConfig) => void;
  currentConfig: SiteConfig;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onConfigChange, currentConfig }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INQUIRIES' | 'CONTENT' | 'SYSTEM'>('DASHBOARD');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [tempConfig, setTempConfig] = useState<SiteConfig>(currentConfig);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('v9_inquiries') || '[]');
    setInquiries(data);

    // Load saved model selection
    const savedModel = localStorage.getItem('v9_ollama_model');
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  const fetchOllamaModels = async () => {
    setModelLoading(true);
    setModelError(null);
    try {
      const response = await fetch('/api/ollama/tags');
      if (!response.ok) throw new Error('Failed to connect to Ollama');
      const data = await response.json();
      const models = data.models?.map((m: any) => m.name) || [];
      setOllamaModels(models);
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0]);
      }
    } catch (error: any) {
      setModelError(error.message || 'Connection failed');
      setOllamaModels([]);
    } finally {
      setModelLoading(false);
    }
  };

  const saveModelSelection = () => {
    if (selectedModel) {
      localStorage.setItem('v9_ollama_model', selectedModel);
      alert(`MODEL_CONFIGURED: ${selectedModel} 이(가) 기본 모델로 설정되었습니다.`);
    }
  };

  const saveConfig = () => {
    localStorage.setItem('v9_site_config', JSON.stringify(tempConfig));
    onConfigChange(tempConfig);
    alert('SYSTEM_CONFIG_SYNCHRONIZED: 모든 텍스트 변경사항이 반영되었습니다.');
  };

  const updateStatus = (id: number, status: Inquiry['status']) => {
    const updated = inquiries.map(iq => iq.id === id ? { ...iq, status } : iq);
    setInquiries(updated);
    localStorage.setItem('v9_inquiries', JSON.stringify(updated));
  };

  const deleteInquiry = (id: number) => {
    if (confirm('이 로그를 영구 삭제하시겠습니까?')) {
      const updated = inquiries.filter(iq => iq.id !== id);
      setInquiries(updated);
      localStorage.setItem('v9_inquiries', JSON.stringify(updated));
    }
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `v9_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const inputClass = "w-full bg-black border border-slate-700 p-2 text-xs text-white font-mono focus:border-[#ff7043] outline-none transition-colors";
  const labelClass = "text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1";

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-0 md:p-6 backdrop-blur-sm">
      <div className="w-full h-full max-w-6xl bg-[#070707] border-2 border-[#ff7043] shadow-[0_0_60px_rgba(255,112,67,0.1)] flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <div className="w-16 md:w-64 border-r border-slate-800 bg-black flex flex-col">
          <div className="p-4 border-b border-slate-800 mb-4">
            <h2 className="retro-text text-xl glow-orange hidden md:block">V9_ADMIN_OS</h2>
            <div className="text-[10px] text-slate-600 font-mono hidden md:block uppercase tracking-tighter">Internal_Access_Level: 09</div>
          </div>
          
          <nav className="flex-grow space-y-1 px-2 overflow-y-auto scrollbar-hide">
            {[
              { id: 'DASHBOARD', label: 'Dashboard', icon: '📊' },
              { id: 'INQUIRIES', label: 'Inquiries', icon: '📩' },
              { id: 'CONTENT', label: 'CMS Manager', icon: '📝' },
              { id: 'SYSTEM', label: 'System', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-3 flex items-center gap-3 font-mono text-xs transition-all ${
                  activeTab === tab.id ? 'bg-[#ff704320] text-[#ff7043] border-l-2 border-l-[#ff7043]' : 'text-slate-500 hover:bg-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden md:block uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={onClose} className="p-4 mt-auto border-t border-slate-800 text-slate-600 hover:text-white font-mono text-[10px] uppercase text-center">
            Exit_Shell [ESC]
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col overflow-hidden bg-logo-grid">
          <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/50">
            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest">
              <span className="text-[#ff7043] font-bold">MODE</span>: {activeTab}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              REALTIME_DATA_VFS_MOUNTED
            </div>
          </header>

          <main className="flex-grow overflow-auto p-6 scrollbar-hide">
            {activeTab === 'DASHBOARD' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/40 border border-slate-800 p-4 border-glow-orange">
                    <div className="text-slate-500 text-[10px] uppercase mb-1 font-mono">Total Leads</div>
                    <div className="text-4xl retro-text text-[#ff7043]">{inquiries.length}</div>
                    <div className="mt-2 h-1 bg-slate-800 w-full"><div className="h-full bg-[#ff7043]" style={{width: '100%'}}></div></div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-4">
                    <div className="text-slate-500 text-[10px] uppercase mb-1 font-mono">Pending Task</div>
                    <div className="text-4xl retro-text text-slate-200">{inquiries.filter(i => i.status !== 'RESOLVED').length}</div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-4">
                    <div className="text-slate-500 text-[10px] uppercase mb-1 font-mono">AI API Node</div>
                    <div className="text-4xl retro-text text-emerald-400">ACTIVE</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'INQUIRIES' && (
              <div className="bg-[#0a0a0a] border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-black text-slate-500 border-b border-slate-800">
                        <th className="p-4">CLIENT_LOG</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.length === 0 ? (
                        <tr><td colSpan={3} className="p-20 text-center text-slate-600 uppercase">Empty_Log_Buffer</td></tr>
                      ) : (
                        inquiries.map(iq => (
                          <tr key={iq.id} className="border-b border-slate-900 hover:bg-slate-900/50">
                            <td className="p-4">
                              <div className="text-slate-200 font-bold uppercase">{iq.name}</div>
                              <div className="text-slate-500 mt-1 italic">"{iq.details}"</div>
                              <div className="mt-1 text-[#ff7043]">Budget: {iq.budget}</div>
                            </td>
                            <td className="p-4">
                               <select 
                                value={iq.status || 'NEW'} 
                                onChange={(e) => updateStatus(iq.id, e.target.value as any)}
                                className="bg-black border border-slate-800 text-[9px] p-1 text-slate-400 outline-none"
                              >
                                <option value="NEW">NEW</option>
                                <option value="PENDING">PENDING</option>
                                <option value="RESOLVED">RESOLVED</option>
                              </select>
                            </td>
                            <td className="p-4">
                               <button onClick={() => deleteInquiry(iq.id)} className="text-slate-700 hover:text-red-500">FLUSH</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'CONTENT' && (
              <div className="space-y-8 max-w-4xl pb-20">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="retro-text text-2xl text-[#ff7043] uppercase">GLOBAL_UI_TEXT_STRINGS</h3>
                  <button 
                    onClick={saveConfig}
                    className="bg-[#ff7043] text-black font-bold px-6 py-2 text-[10px] uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(255,112,67,0.3)]"
                  >
                    DEPLOY_ALL_CHANGES
                  </button>
                </div>

                {/* Header Config */}
                <section className="space-y-4">
                  <h4 className="text-slate-400 text-xs font-mono uppercase border-l-2 border-[#ff7043] pl-2">01. Header Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Company Name</label>
                      <input type="text" value={tempConfig.companyName} onChange={e => setTempConfig({...tempConfig, companyName: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Header Slogan</label>
                      <input type="text" value={tempConfig.slogan} onChange={e => setTempConfig({...tempConfig, slogan: e.target.value})} className={inputClass} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className={labelClass}>Header Sub-Label (Technical)</label>
                      <input type="text" value={tempConfig.subLabel} onChange={e => setTempConfig({...tempConfig, subLabel: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Terminal Config */}
                <section className="space-y-4">
                  <h4 className="text-slate-400 text-xs font-mono uppercase border-l-2 border-[#ff7043] pl-2">02. Console & Buttons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Console Tab Title</label>
                      <input type="text" value={tempConfig.terminalTitle} onChange={e => setTempConfig({...tempConfig, terminalTitle: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Welcome Message</label>
                      <input type="text" value={tempConfig.welcomeMessage} onChange={e => setTempConfig({...tempConfig, welcomeMessage: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Inquiry Button Text</label>
                      <input type="text" value={tempConfig.inquiryBtnText} onChange={e => setTempConfig({...tempConfig, inquiryBtnText: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Admin Button Text</label>
                      <input type="text" value={tempConfig.adminBtnText} onChange={e => setTempConfig({...tempConfig, adminBtnText: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Sections Config */}
                <section className="space-y-4">
                  <h4 className="text-slate-400 text-xs font-mono uppercase border-l-2 border-[#ff7043] pl-2">03. Section Headers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Metrics Title</label>
                      <input type="text" value={tempConfig.metricsTitle} onChange={e => setTempConfig({...tempConfig, metricsTitle: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Modules Title</label>
                      <input type="text" value={tempConfig.modulesTitle} onChange={e => setTempConfig({...tempConfig, modulesTitle: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Mission Title</label>
                      <input type="text" value={tempConfig.missionTitle} onChange={e => setTempConfig({...tempConfig, missionTitle: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Mission Content Config */}
                <section className="space-y-4">
                  <h4 className="text-slate-400 text-xs font-mono uppercase border-l-2 border-[#ff7043] pl-2">04. Mission & Narrative</h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Main Narrative Text</label>
                      <textarea rows={2} value={tempConfig.missionMainText} onChange={e => setTempConfig({...tempConfig, missionMainText: e.target.value})} className={inputClass + " resize-none"} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Highlight Quote</label>
                      <input type="text" value={tempConfig.missionQuote} onChange={e => setTempConfig({...tempConfig, missionQuote: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Supplemenatary Text (Footer of section)</label>
                      <textarea rows={2} value={tempConfig.missionSubText} onChange={e => setTempConfig({...tempConfig, missionSubText: e.target.value})} className={inputClass + " resize-none"} />
                    </div>
                  </div>
                </section>

                {/* Footer Config */}
                <section className="space-y-4">
                  <h4 className="text-slate-400 text-xs font-mono uppercase border-l-2 border-[#ff7043] pl-2">05. Global Footer</h4>
                  <div className="space-y-1">
                    <label className={labelClass}>Copyright & Footer Details</label>
                    <input type="text" value={tempConfig.footerText} onChange={e => setTempConfig({...tempConfig, footerText: e.target.value})} className={inputClass} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'SYSTEM' && (
              <div className="space-y-6 max-w-2xl">
                {/* LLM Model Configuration */}
                <div className="p-6 border border-slate-800 bg-slate-900/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="retro-text text-xl text-[#ff7043] uppercase">LLM_Model_Config</h3>
                    <button
                      onClick={fetchOllamaModels}
                      disabled={modelLoading}
                      className="text-[10px] border border-slate-700 px-3 py-1 text-slate-400 hover:border-[#ff7043] hover:text-[#ff7043] transition-all font-mono disabled:opacity-50"
                    >
                      {modelLoading ? 'SCANNING...' : 'REFRESH_MODELS'}
                    </button>
                  </div>

                  {modelError && (
                    <div className="mb-4 p-3 border border-red-900 bg-red-900/20 text-red-400 text-xs font-mono">
                      ERR: {modelError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">
                        Ollama Model Selection
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="flex-grow bg-black border border-slate-700 p-3 text-xs text-white font-mono focus:border-[#ff7043] outline-none transition-colors"
                        >
                          {ollamaModels.length === 0 ? (
                            <option value="">-- REFRESH를 눌러 모델 목록 로드 --</option>
                          ) : (
                            ollamaModels.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))
                          )}
                        </select>
                        <button
                          onClick={saveModelSelection}
                          disabled={!selectedModel || ollamaModels.length === 0}
                          className="bg-[#ff7043] text-black font-bold px-4 py-2 text-[10px] uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 font-mono space-y-1">
                      <div>CURRENT_MODEL: <span className="text-slate-400">{selectedModel || 'NOT_SET'}</span></div>
                      <div>AVAILABLE_MODELS: <span className="text-slate-400">{ollamaModels.length}</span></div>
                    </div>
                  </div>
                </div>

                {/* System Actions */}
                <div className="p-6 border border-slate-800 bg-slate-900/10">
                  <h3 className="retro-text text-xl text-slate-300 mb-4 uppercase">System_Action_Matrix</h3>
                  <button onClick={downloadJSON} className="w-full bg-slate-900 border border-[#ff7043] text-[#ff7043] p-4 text-xs font-mono font-bold hover:bg-[#ff7043] hover:text-black transition-all">
                    EXPORT_VFS_BACKUP.json
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
