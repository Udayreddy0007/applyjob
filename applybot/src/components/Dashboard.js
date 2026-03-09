import { useRef } from "react";
import { matchColor } from "../styles/theme";

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, applications, analysisResult, loadingAnalysis, loadingMatch, loadingJobs,
  onAnalyze, onFetchJobs, onMatchAll, onApply, onAutoApplyAll, autoApplying, showToast,
}) {
  const fileRef = useRef();
  const matchedJobs = jobs.filter((j) => j.match != null);
  const topMatches = [...matchedJobs].sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 4);
  const readyToAutoApply = jobs.filter((j) => j.match >= 60 && !j.applied).length;

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const text = await file.text();
    setResume(text);
    showToast("✅ Resume uploaded! Click 'Find Matching Jobs' to get started.");
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>
          Welcome to ApplyBot ⚡
        </div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>Upload resume → AI finds matching jobs → Auto-applies → Tracks everything.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Jobs Loaded", val: jobs.length, icon: "◈" },
          { label: "Scored", val: matchedJobs.length, icon: "⬡" },
          { label: "Applied", val: applications.length, icon: "✓" },
          { label: "Ready to Apply", val: readyToAutoApply, icon: "⚡" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{s.icon}</div>
            <div className="stat-num">{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">① Upload Resume</div>
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>{resume ? "📄" : "⬆"}</div>
          <div style={{ fontSize: "13px", color: resume ? "#4ade80" : "#94a3b8", marginBottom: "4px" }}>
            {resumeFile ? `✓ ${resumeFile.name}` : "Click to upload (.txt, .md)"}
          </div>
          <div style={{ fontSize: "11px", color: "#475569" }}>Text-based files only</div>
          <input ref={fileRef} type="file" accept=".txt,.md,.doc" onChange={handleUpload} style={{ display: "none" }} />
        </div>
        {!resume && (
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "6px" }}>Or paste resume here:</div>
            <textarea rows={6} placeholder="Paste your full resume text here..." value={resume} onChange={(e) => setResume(e.target.value)} />
          </div>
        )}
        {resume && (
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#4ade80" }}>✓ {resume.length} characters loaded</span>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "3px 10px" }} onClick={() => { setResume(""); setResumeFile(null); }}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">② Find Matching Jobs</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI extracts your exact role and skills, then fetches matching jobs from <strong style={{ color: "#7dd3fc" }}>15 portals</strong> including fresher-specific ones.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs || !resume}>
            {loadingJobs ? <><span className="spinner" /> Finding Jobs...</> : "⬡ Find Matching Jobs"}
          </button>
          <button className="btn btn-ghost" onClick={onAnalyze} disabled={loadingAnalysis || !resume}>
            {loadingAnalysis ? <><span className="spinner" /> Analyzing...</> : "⬡ Analyze Resume"}
          </button>
        </div>
        {analysisResult && (
          <div style={{ marginTop: "16px", background: "#080c14", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "16px", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
            {analysisResult}
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">③ Score & Match</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI scores each job against your resume on 5 factors and shows missing skills.
        </p>
        <button className="btn btn-primary" onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0}>
          {loadingMatch ? <><span className="spinner" /> Scoring {jobs.length} jobs...</> : `⬡ Score All ${jobs.length} Jobs`}
        </button>
      </div>

      {/* Step 4 - Auto Apply */}
      {readyToAutoApply > 0 && (
        <div className="card" style={{ marginBottom: "14px", border: "1px solid #1e3f5a", background: "#0a1628" }}>
          <div className="section-title">④ Auto Apply</div>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
            <strong style={{ color: "#4ade80" }}>{readyToAutoApply} jobs</strong> with 60%+ match are ready. Auto-apply opens each job in a new tab and tracks your application.
          </p>
          <button className="btn btn-success" onClick={onAutoApplyAll} disabled={autoApplying}>
            {autoApplying ? <><span className="spinner" /> Auto-Applying...</> : `⚡ Auto Apply to ${readyToAutoApply} Jobs`}
          </button>
        </div>
      )}

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div className="card">
          <div className="section-title">🏆 Top Matches</div>
          {topMatches.map((job) => (
            <div key={job.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{job.title}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "3px" }}>{job.company} · {job.portal}</div>
                {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc" }}>⬡ {job.matchReason}</div>}
                {job.missingSkills?.length > 0 && (
                  <div style={{ fontSize: "11px", color: "#f87171" }}>⚠ Missing: {job.missingSkills.slice(0, 3).join(", ")}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "12px" }}>
                <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44` }}>
                  {job.match}%
                </div>
                {job.applied
                  ? <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ Applied</span>
                  : <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "11px" }} onClick={() => onApply(job)}>Apply</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
