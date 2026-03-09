import { useRef, useState } from "react";
import { matchColor } from "../styles/theme";

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, applications, analysisResult, loadingAnalysis, loadingMatch, loadingJobs,
  onAnalyze, onFetchJobs, onMatchAll, onApply, onAutoApplyAll, autoApplying, showToast,
}) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);

  const matchedJobs = jobs.filter((j) => j.match != null);
  const sortedJobs = [...jobs].sort((a, b) => (b.match || 0) - (a.match || 0));
  const displayedJobs = showAllJobs ? sortedJobs : sortedJobs.slice(0, 6);
  const readyToAutoApply = jobs.filter((j) => j.match >= 60 && !j.applied).length;

  async function readFile(file) {
    setFileLoading(true);
    setResumeFile(file);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        const text = await extractPDFText(file);
        if (text && text.trim().length > 30) {
          setResume(text);
          showToast(`✅ PDF resume loaded! (${text.length} chars)`);
        } else {
          setResume("");
          showToast("Could not extract PDF text. Please paste your resume below.", "error");
        }
      } else if (["txt", "md", "doc", "docx", "rtf"].includes(ext)) {
        const text = await file.text();
        setResume(text);
        showToast(`✅ Resume loaded! (${text.length} chars)`);
      } else {
        showToast("Unsupported file. Use PDF, TXT, or DOC.", "error");
      }
    } catch {
      showToast("Could not read file. Please paste your resume below.", "error");
    }
    setFileLoading(false);
  }

  async function extractPDFText(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result || "";
          const matches = text.match(/\(([^)]+)\)/g) || [];
          const extracted = matches.map((m) => m.slice(1, -1)).filter((t) => t.length > 1 && /[a-zA-Z]/.test(t)).join(" ");
          if (extracted.length > 100) { resolve(extracted); return; }
          const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n").trim();
          resolve(cleaned.length > 50 ? cleaned : "");
        } catch { resolve(""); }
      };
      reader.readAsBinaryString(file);
    });
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "4px" }}>
          Welcome to ApplyBot ⚡
        </div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>Upload resume → AI finds matching jobs → Auto-applies → Tracks everything.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Jobs Loaded", val: jobs.length, icon: "◈", color: "#38bdf8" },
          { label: "Scored", val: matchedJobs.length, icon: "⬡", color: "#818cf8" },
          { label: "Applied", val: applications.length, icon: "✓", color: "#4ade80" },
          { label: "Ready to Apply", val: readyToAutoApply, icon: "⚡", color: "#fbbf24" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
            <div className="stat-num" style={{ fontSize: "28px", color: s.color }}>{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Upload */}
        <div className="card">
          <div className="section-title">① Upload Resume</div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${dragOver ? "#38bdf8" : resume ? "#22c55e" : "#1e293b"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#0d1f35" : resume ? "#061a0e" : "transparent", transition: "all 0.2s", marginBottom: "12px" }}
          >
            {fileLoading ? (
              <><div style={{ fontSize: "22px", marginBottom: "6px" }}>⏳</div><div style={{ fontSize: "12px", color: "#7dd3fc" }}>Reading...</div></>
            ) : resume ? (
              <><div style={{ fontSize: "22px", marginBottom: "6px" }}>📄</div><div style={{ fontSize: "12px", color: "#4ade80" }}>✓ {resumeFile?.name || "Resume loaded"}</div><div style={{ fontSize: "11px", color: "#475569" }}>{resume.length} chars · Click to replace</div></>
            ) : (
              <><div style={{ fontSize: "24px", marginBottom: "8px" }}>⬆</div><div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>Click or drag & drop</div><div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>{["PDF","TXT","DOC","DOCX"].map((e) => <span key={e} style={{ background: "#0d1f35", border: "1px solid #1e3f5a", color: "#7dd3fc", padding: "2px 8px", borderRadius: "20px", fontSize: "10px" }}>{e}</span>)}</div></>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.doc,.docx,.rtf" onChange={(e) => { const f = e.target.files[0]; if (f) readFile(f); }} style={{ display: "none" }} />
          </div>
          <textarea rows={4} placeholder="Or paste resume text here..." value={resume} onChange={(e) => setResume(e.target.value)} />
          {resume && <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}><span style={{ fontSize: "11px", color: "#4ade80" }}>✓ {resume.length} chars ready</span><button className="btn btn-ghost" style={{ fontSize: "11px", padding: "2px 8px" }} onClick={() => { setResume(""); setResumeFile(null); if (fileRef.current) fileRef.current.value = ""; }}>✕ Clear</button></div>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-title">② Find Jobs</div>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>AI extracts your role and searches 15 portals for matching jobs.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs || !resume} style={{ width: "100%" }}>
                {loadingJobs ? <><span className="spinner" /> Finding Jobs...</> : "⬡ Find Matching Jobs"}
              </button>
              <button className="btn btn-ghost" onClick={onAnalyze} disabled={loadingAnalysis || !resume} style={{ width: "100%" }}>
                {loadingAnalysis ? <><span className="spinner" /> Analyzing...</> : "⬡ Analyze Resume"}
              </button>
              <button className="btn btn-ghost" onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0} style={{ width: "100%" }}>
                {loadingMatch ? <><span className="spinner" /> Scoring...</> : `⬡ Score All ${jobs.length} Jobs`}
              </button>
              {readyToAutoApply > 0 && (
                <button className="btn btn-success" onClick={onAutoApplyAll} disabled={autoApplying} style={{ width: "100%" }}>
                  {autoApplying ? <><span className="spinner" /> Auto-Applying...</> : `⚡ Auto Apply (${readyToAutoApply} Jobs)`}
                </button>
              )}
            </div>
          </div>

          {analysisResult && (
            <div className="card" style={{ flex: 1, maxHeight: "200px", overflowY: "auto" }}>
              <div style={{ fontSize: "12px", color: "#7dd3fc", marginBottom: "8px", fontWeight: "600" }}>📊 Resume Analysis</div>
              <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{analysisResult}</div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs List in Dashboard */}
      {jobs.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div className="section-title" style={{ margin: 0 }}>
              🎯 Jobs Found <span style={{ fontSize: "13px", color: "#475569", fontWeight: "400" }}>({jobs.length} total)</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 12px" }} onClick={onMatchAll} disabled={loadingMatch || !resume}>
                {loadingMatch ? <><span className="spinner" /></> : "⬡ Score All"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {displayedJobs.map((job) => (
              <div key={job.id} className="job-card" style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                      <span className="portal-badge" style={{ background: job.portalColor || "#6366f1", fontSize: "10px" }}>{job.portal}</span>
                      {job.fresherFriendly && <span style={{ background: "#064e3b", color: "#4ade80", border: "1px solid #166534", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>🎓 Fresher</span>}
                      {job.applied && <span style={{ fontSize: "10px", color: "#4ade80" }}>✓ Applied</span>}
                      <span style={{ fontSize: "10px", color: "#475569" }}>{job.posted}</span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontWeight: "700", marginBottom: "2px" }}>{job.title}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>{job.company} · {job.location}</div>
                    {job.salary && job.salary !== "Not specified" && <div style={{ fontSize: "11px", color: "#7dd3fc", marginBottom: "6px" }}>{job.salary}</div>}
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {(job.tags || []).slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>
                    {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc", marginTop: "5px" }}>⬡ {job.matchReason}</div>}
                    {job.missingSkills?.length > 0 && <div style={{ fontSize: "11px", color: "#f87171", marginTop: "3px" }}>⚠ Missing: {job.missingSkills.slice(0, 3).join(", ")}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                    {job.match != null ? (
                      <div>
                        <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44`, display: "block", textAlign: "center", marginBottom: "4px" }}>{job.match}%</div>
                        <div className="progress-bar" style={{ width: "70px" }}><div className="progress-fill" style={{ width: `${job.match}%`, background: matchColor(job.match) }} /></div>
                      </div>
                    ) : <div style={{ fontSize: "10px", color: "#334155" }}>Not scored</div>}
                    {!job.applied ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        {job.url && <a href={job.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "10px" }}>↗</button></a>}
                        <button className="btn btn-success" style={{ padding: "4px 10px", fontSize: "10px" }} onClick={() => onApply(job)}>Apply</button>
                      </div>
                    ) : <span style={{ fontSize: "10px", color: "#4ade80" }}>✓ Applied</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jobs.length > 6 && (
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: "12px", fontSize: "12px" }} onClick={() => setShowAllJobs(!showAllJobs)}>
              {showAllJobs ? "▲ Show Less" : `▼ Show All ${jobs.length} Jobs`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


