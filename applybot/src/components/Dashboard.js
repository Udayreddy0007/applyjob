import { useRef } from "react";
import { matchColor } from "../styles/theme";

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, analysisResult, loadingAnalysis, loadingMatch,
  onAnalyze, onMatchAll, onApply, showToast,
}) {
  const fileRef = useRef();
  const appliedJobs = jobs.filter((j) => j.applied);

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const text = await file.text();
    setResume(text);
    showToast("Resume uploaded successfully!");
  }

  const topMatches = [...jobs]
    .filter((j) => j.match != null)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>
          Welcome to ApplyBot
        </div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>AI-powered job applications across LinkedIn, Indeed, Glassdoor & more.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Jobs Available", val: jobs.length, icon: "◈" },
          { label: "Applied", val: appliedJobs.length, icon: "✓" },
          { label: "Matched", val: jobs.filter((j) => j.match).length, icon: "⬡" },
          { label: "Portals", val: 4, icon: "⊕" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
            <div className="stat-num">{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.05em", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Resume Upload */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="section-title">① Upload Resume</div>
        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>{resume ? "📄" : "⬆"}</div>
          <div style={{ fontSize: "14px", color: resume ? "#4ade80" : "#94a3b8", marginBottom: "4px" }}>
            {resumeFile ? resumeFile.name : "Click to upload resume (.txt, .pdf, .md)"}
          </div>
          <div style={{ fontSize: "11px", color: "#475569" }}>Supports text-based files</div>
          <input ref={fileRef} type="file" accept=".txt,.pdf,.md,.doc" onChange={handleResumeUpload} style={{ display: "none" }} />
        </div>

        {resume && (
          <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onAnalyze} disabled={loadingAnalysis}>
              {loadingAnalysis ? <><span className="spinner" /> Analyzing...</> : "⬡ Analyze Resume"}
            </button>
            <button className="btn btn-primary" onClick={onMatchAll} disabled={loadingMatch}>
              {loadingMatch ? <><span className="spinner" /> Matching...</> : "⬡ Match All Jobs"}
            </button>
          </div>
        )}

        {analysisResult && (
          <div style={{ marginTop: "16px", background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "16px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
            {analysisResult}
          </div>
        )}

        {!resume && (
          <div style={{ marginTop: "14px" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px" }}>Or paste resume text:</div>
            <textarea rows={6} placeholder="Paste your resume content here..." value={resume} onChange={(e) => setResume(e.target.value)} />
          </div>
        )}
      </div>

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div className="card">
          <div className="section-title">② Top Matches</div>
          {topMatches.map((job) => (
            <div key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{job.title}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{job.company} · {job.portal}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
