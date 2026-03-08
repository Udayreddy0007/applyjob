import { useRef } from "react";
import { matchColor } from "../styles/theme";

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, analysisResult, loadingAnalysis, loadingMatch, loadingJobs,
  onAnalyze, onFetchJobs, onMatchAll, onApply, showToast,
}) {
  const fileRef = useRef();
  const appliedJobs = jobs.filter((j) => j.applied);
  const matchedJobs = jobs.filter((j) => j.match != null);
  const topMatches = [...matchedJobs].sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 3);

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const text = await file.text();
    setResume(text);
    showToast("Resume uploaded! Click 'Find Jobs For Me' to get personalized listings.");
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>
          Welcome to ApplyBot
        </div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>Upload resume → Find jobs → Match & Apply. Powered by AI + 10 real job portals.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Jobs Loaded", val: jobs.length, icon: "◈" },
          { label: "Applied", val: appliedJobs.length, icon: "✓" },
          { label: "Scored", val: matchedJobs.length, icon: "⬡" },
          { label: "Top Match", val: topMatches[0] ? `${topMatches[0].match}%` : "—", icon: "⊕" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
            <div className="stat-num">{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.05em", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="section-title">① Upload Your Resume</div>
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>{resume ? "📄" : "⬆"}</div>
          <div style={{ fontSize: "14px", color: resume ? "#4ade80" : "#94a3b8", marginBottom: "4px" }}>
            {resumeFile ? resumeFile.name : "Click to upload resume (.txt, .md)"}
          </div>
          <div style={{ fontSize: "11px", color: "#475569" }}>Supports .txt and .md files</div>
          <input ref={fileRef} type="file" accept=".txt,.md,.doc" onChange={handleResumeUpload} style={{ display: "none" }} />
        </div>
        {!resume && (
          <div style={{ marginTop: "14px" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px" }}>Or paste your resume text below:</div>
            <textarea rows={7} placeholder="Paste your full resume here..." value={resume} onChange={(e) => setResume(e.target.value)} />
          </div>
        )}
        {resume && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#4ade80" }}>✓ Resume loaded ({resume.length} characters)</span>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "4px 10px" }} onClick={() => { setResume(""); setResumeFile(null); }}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="section-title">② Analyze & Find Relevant Jobs</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI reads your resume, extracts your skills, and fetches matching jobs from <strong style={{ color: "#7dd3fc" }}>10 real job portals</strong> — Remotive, Arbeitnow, The Muse, Himalayas, Working Nomads, Jobicy, Findwork, Remote OK & more.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs || !resume}>
            {loadingJobs ? <><span className="spinner" /> Finding Jobs...</> : "⬡ Find Jobs For Me"}
          </button>
          <button className="btn btn-ghost" onClick={onAnalyze} disabled={loadingAnalysis || !resume}>
            {loadingAnalysis ? <><span className="spinner" /> Analyzing...</> : "⬡ Analyze My Resume"}
          </button>
        </div>

        {loadingAnalysis && (
          <div style={{ marginTop: "14px", fontSize: "12px", color: "#7dd3fc" }}>
            <span className="spinner" style={{ marginRight: "8px" }} /> Analyzing your resume with AI...
          </div>
        )}

        {analysisResult && (
          <div style={{ marginTop: "16px", background: "#080c14", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "18px", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
            {analysisResult}
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="section-title">③ Score Jobs Against Your Resume</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI scores each job on 5 factors: skills match, experience, role relevance, industry fit, and education. Results are sorted by best match.
        </p>
        <button className="btn btn-primary" onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0}>
          {loadingMatch ? <><span className="spinner" /> Scoring {jobs.length} jobs...</> : `⬡ Score All ${jobs.length} Jobs`}
        </button>
        {jobs.length === 0 && (
          <div style={{ fontSize: "11px", color: "#475569", marginTop: "8px" }}>Find jobs first using step ②</div>
        )}
      </div>

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div className="card">
          <div className="section-title">🏆 Top Matches</div>
          {topMatches.map((job) => (
            <div key={job.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{job.title}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{job.company} · {job.portal}</div>
                {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc" }}>⬡ {job.matchReason}</div>}
                {job.missingSkills?.length > 0 && (
                  <div style={{ fontSize: "11px", color: "#f87171", marginTop: "2px" }}>⚠ Missing: {job.missingSkills.join(", ")}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "12px" }}>
                <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44` }}>
                  {job.match}%
                </div>
                {job.applied ? (
                  <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ Applied</span>
                ) : (
                  <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "11px" }} onClick={() => onApply(job)}>Apply</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
