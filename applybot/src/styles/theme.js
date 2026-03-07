export const matchColor = (score) => {
  if (!score) return "#444";
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@700;800&display=swap');

  .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; font-family: 'DM Mono', monospace; font-size: 13px; color: #64748b; transition: all 0.2s; position: relative; letter-spacing: 0.05em; }
  .tab-btn.active { color: #38bdf8; }
  .tab-btn.active::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 20px; height: 2px; background: #38bdf8; border-radius: 2px; }
  .tab-btn:hover { color: #94a3b8; }

  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; transition: all 0.2s; letter-spacing: 0.03em; }
  .btn-primary { background: #38bdf8; color: #080c14; }
  .btn-primary:hover { background: #7dd3fc; transform: translateY(-1px); }
  .btn-primary:disabled { background: #1e3a4a; color: #4a6070; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #1e293b; }
  .btn-ghost:hover { border-color: #38bdf8; color: #38bdf8; }
  .btn-success { background: #22c55e; color: #080c14; }
  .btn-success:hover { background: #4ade80; transform: translateY(-1px); }
  .btn-success:disabled { background: #14532d; color: #166534; cursor: not-allowed; transform: none; }

  .card { background: #0f1623; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; }
  .job-card { background: #0f1623; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s; }
  .job-card:hover { border-color: #38bdf8; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(56,189,248,0.08); }
  .job-card.selected { border-color: #38bdf8; box-shadow: 0 0 0 1px #38bdf822; }

  .tag { background: #0d1f35; color: #7dd3fc; border: 1px solid #1e3f5a; padding: 3px 10px; border-radius: 20px; font-size: 11px; letter-spacing: 0.05em; }
  .score-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .portal-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; color: white; }

  textarea { background: #080c14; border: 1px solid #1e293b; border-radius: 8px; color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 12px; padding: 12px; resize: vertical; width: 100%; outline: none; transition: border-color 0.2s; line-height: 1.6; }
  textarea:focus { border-color: #38bdf8; }

  .stat-card { background: #0f1623; border: 1px solid #1e293b; border-radius: 12px; padding: 20px 24px; }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .panel { background: #0f1623; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 780px; max-height: 90vh; overflow-y: auto; padding: 30px; }

  .toast { position: fixed; bottom: 30px; right: 30px; z-index: 999; padding: 14px 22px; border-radius: 10px; font-size: 13px; font-family: 'DM Mono', monospace; animation: slideUp 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
  .toast.success { background: #064e3b; color: #4ade80; border: 1px solid #166534; }
  .toast.error { background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .pulse { animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  .spinner { width: 16px; height: 16px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px; }

  .filter-btn { background: #0f1623; border: 1px solid #1e293b; border-radius: 8px; padding: 7px 16px; font-family: 'DM Mono', monospace; font-size: 12px; color: #64748b; cursor: pointer; transition: all 0.2s; }
  .filter-btn.active { border-color: #38bdf8; color: #38bdf8; background: #0d1f35; }
  .filter-btn:hover { border-color: #334155; color: #94a3b8; }

  .progress-bar { height: 6px; border-radius: 3px; background: #1e293b; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

  .upload-zone { border: 2px dashed #1e293b; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: #38bdf8; background: #0d1f350a; }
`;
