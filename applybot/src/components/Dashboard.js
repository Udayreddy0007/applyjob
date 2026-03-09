import { useRef, useState } from "react";
import { matchColor } from "../styles/theme";

const EXP_OPTIONS = ["All", "Entry Level", "Internship", "Full-time", "Part-time"];
const TYPE_OPTIONS = ["All", "Remote", "Hybrid", "On-site"];

function FilterChip({ label, value, current, onSelect, color }) {
  return (
    <button onClick={() => onSelect(value === current ? "All" : value)}
      style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", borderColor: current === value ? color : "#1e293b", background: current === value ? color + "22" : "transparent", color: current === value ? color : "#64748b", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "12px", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, applications, analysisResult, loadingAnalysis, loadingMatch, loadingJobs,
  onAnalyze, onFetchJobs, onMatchAll, onApply, onAutoApplyAll, autoApplying, showToast,
}) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [expLevel, setExpLevel] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [easyApply, setEasyApply] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  const filteredJobs = jobs.filter(j => {
    if (expLevel !== "All") {
      const text = ((j.title || "") + " " + (j.description || "") + " " + (j.type || "")).toLowerCase();
      if (expLevel === "Entry Level" && !["junior","entry","entry-level","graduate","fresher","trainee","associate","new grad"].some(k => text.includes(k))) return false;
      if (expLevel === "Internship" && !["intern","internship","trainee","apprentice"].some(k => text.includes(k))) return false;
      if (expLevel === "Full-time" && !(j.type || "").toLowerCase().includes("full")) return false;
      if (expLevel === "Part-time" && !(j.type || "").toLowerCase().includes("part")) return false;
    }
    if (jobType !== "All") {
      const loc = ((j.location || "") + " " + (j.type || "")).toLowerCase();
      if (jobType === "Remote" && !loc.includes("remote")) return false;
      if (jobType === "Hybrid" && !loc.includes("hybrid")) return false;
      if (jobType === "On-site" && loc.includes("remote")) return false;
    }
    if (easyApply && !j.url) return false;
    return true;
  });

  const sorted = [...filteredJobs].sort((a, b) => (b.match || 0) - (a.match || 0));
  const displayed = showAll ? sorted : sorted.slice(0, 8);
  const matchedJobs = jobs.filter(j => j.match != null);

  async function readFile(file) {
    setFileLoading(true);
    setResumeFile(file);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        const text = await extractPDFText(file);
        if (text?.trim().length > 30) { setResume(text); showToast(`✅ PDF loaded (${text.length} chars)`); }
        else { setResume(""); showToast("PDF text could not be extracted. Please paste your resume below.", "error"); }
      } else {
        const text = await file.text();
        setResume(text);
        showToast(`✅ Resume loaded (${text.length} chars)`);
      }
    } catch { showToast("File read failed. Paste resume in the text box.", "error"); }
    setFileLoading(false);
  }

  async function extractPDFText(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const raw = e.target.result || "";
          const matches = raw.match(/\(([^)]+)\)/g) || [];
          const extracted = matches.map(m => m.slice(1,-1)).filter(t => t.length > 1 && /[a-zA-Z]/.test(t)).join(" ");
          if (extracted.length > 100) { resolve(extracted); return; }
          const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g," ").replace(/\s{3,}/g,"\n").trim();
          resolve(cleaned.length > 50 ? cleaned : "");
        } catch { resolve(""); }
      };
      reader.readAsBinaryString(file);
    });
  }

  function sendConfirmationEmail(email, appList) {
    const subject = `ApplyBot – You applied to ${appList.length} job(s)`;
    const body = appList.map((a, i) =>
      `${i + 1}. ${a.jobTitle} at ${a.company}\n   Portal: ${a.portal}\n   Applied: ${a.appliedAt}\n   Link: ${a.url || "N/A"}\n`
    ).join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi,\n\nHere is your ApplyBot application summary:\n\n" + body + "\n\nGood luck with your job search!\n– ApplyBot")}`;
    window.open(mailto, "_blank");
    showToast(`✅ Email draft opened! Check your mail app.`);
    setShowEmailPrompt(false);
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "24px", fontWeight: "800", background: "linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "4px" }}>Welcome to ApplyBot ⚡</div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>Upload resume → AI finds matching jobs → Filter → Apply → Get email confirmation.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Jobs Found", val: jobs.length, color: "#38bdf8", icon: "◈" },
          { label: "After Filter", val: filteredJobs.length, color: "#818cf8", icon: "⬡" },
          { label: "Scored", val: matchedJobs.length, color: "#f59e0b", icon: "★" },
          { label: "Applied", val: applications.length, color: "#4ade80", icon: "✓" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "28px", fontWeight: "800", color: s.color }}>{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload + Actions row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* Upload */}
        <div className="card">
          <div className="section-title">① Upload Resume</div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${dragOver ? "#38bdf8" : resume ? "#22c55e" : "#1e293b"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#0d1f35" : resume ? "#061a0e" : "transparent", transition: "all 0.2s", marginBottom: "12px" }}>
            {fileLoading
              ? <><div style={{ fontSize: "22px", marginBottom: "6px" }}>⏳</div><div style={{ fontSize: "12px", color: "#7dd3fc" }}>Reading file...</div></>
              : resume
              ? <><div style={{ fontSize: "22px", marginBottom: "6px" }}>📄</div><div style={{ fontSize: "12px", color: "#4ade80" }}>✓ {resumeFile?.name || "Resume loaded"}</div><div style={{ fontSize: "11px", color: "#475569" }}>{resume.length} chars · Click to replace</div></>
              : <><div style={{ fontSize: "24px", marginBottom: "8px" }}>⬆</div><div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>Click or drag & drop resume</div><div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>{["PDF","TXT","DOC","DOCX"].map(e => <span key={e} style={{ background: "#0d1f35", border: "1px solid #1e3f5a", color: "#7dd3fc", padding: "2px 8px", borderRadius: "20px", fontSize: "10px" }}>{e}</span>)}</div></>}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.doc,.docx,.rtf" onChange={e => { const f = e.target.files[0]; if (f) readFile(f); }} style={{ display: "none" }} />
          </div>
          <textarea rows={4} placeholder="Or paste your full resume text here..." value={resume} onChange={e => setResume(e.target.value)} />
          {resume && (
            <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ {resume.length} chars ready</span>
              <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "2px 8px" }} onClick={() => { setResume(""); setResumeFile(null); if (fileRef.current) fileRef.current.value = ""; }}>✕ Clear</button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-title">② Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs || !resume} style={{ width: "100%", justifyContent: "center" }}>
                {loadingJobs ? <><span className="spinner" /> Searching 20+ Portals...</> : "⬡ Find Matching Jobs"}
              </button>
              <button className="btn btn-ghost" onClick={() => { onAnalyze(); setShowAnalysis(true); }} disabled={loadingAnalysis || !resume} style={{ width: "100%", justifyContent: "center" }}>
                {loadingAnalysis ? <><span className="spinner" /> Analyzing Resume...</> : "⬡ Analyze My Resume"}
              </button>
              <button className="btn btn-ghost" onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0} style={{ width: "100%", justifyContent: "center" }}>
                {loadingMatch ? <><span className="spinner" /> Scoring Jobs...</> : `⬡ Score All ${jobs.length} Jobs`}
              </button>
              {jobs.length > 0 && (
                <button className="btn btn-success" onClick={onAutoApplyAll} disabled={autoApplying} style={{ width: "100%", justifyContent: "center" }}>
                  {autoApplying ? <><span className="spinner" /> Auto-Applying...</> : `⚡ Auto Apply (${filteredJobs.filter(j => !j.applied).length} Jobs)`}
                </button>
              )}
              {applications.length > 0 && (
                <button className="btn btn-ghost" onClick={() => setShowEmailPrompt(true)} style={{ width: "100%", justifyContent: "center", color: "#7dd3fc", borderColor: "#1e3f5a" }}>
                  ✉ Send Me Application Summary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RESUME ANALYSIS PANEL ── */}
      {showAnalysis && (
        <div className="card" style={{ marginBottom: "16px", border: "1px solid #1e3f5a", background: "#080c14" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", color: "#7dd3fc", fontWeight: "600" }}>📊 Resume Analysis</div>
            <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: "11px" }} onClick={() => setShowAnalysis(false)}>✕</button>
          </div>
          {loadingAnalysis ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <div style={{ marginBottom: "10px" }}><span className="spinner" style={{ width: "24px", height: "24px", borderWidth: "3px" }} /></div>
              <div style={{ fontSize: "13px", color: "#7dd3fc" }}>AI is analyzing your resume...</div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>Checking skills, experience, strengths & improvements</div>
            </div>
          ) : analysisResult ? (
            <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "2", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto", padding: "4px" }}>
              {analysisResult}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#475569" }}>
              Click "Analyze My Resume" to get a detailed AI report.
            </div>
          )}
        </div>
      )}

      {/* ── EMAIL PROMPT MODAL ── */}
      {showEmailPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="card" style={{ maxWidth: "480px", width: "100%", border: "1px solid #1e3f5a" }}>
            <div style={{ fontSize: "16px", color: "#f1f5f9", fontFamily: "'Syne',sans-serif", fontWeight: "700", marginBottom: "6px" }}>✉ Application Confirmation Email</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Enter your email to receive a summary of all {applications.length} application(s) you've made.
            </div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>Applied jobs summary:</div>
              <div style={{ background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 12px", maxHeight: "140px", overflowY: "auto" }}>
                {applications.slice(0, 10).map((a, i) => (
                  <div key={a.id} style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                    <span>{i + 1}. {a.jobTitle} at {a.company}</span>
                    <span style={{ color: "#475569" }}>{a.portal}</span>
                  </div>
                ))}
                {applications.length > 10 && <div style={{ fontSize: "11px", color: "#475569" }}>+ {applications.length - 10} more...</div>}
              </div>
            </div>
            <input
              type="email" placeholder="your@email.com" value={userEmail} onChange={e => setUserEmail(e.target.value)}
              style={{ width: "100%", background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", color: "#e2e8f0", fontFamily: "'DM Mono',monospace", fontSize: "13px", outline: "none", marginBottom: "12px" }}
            />
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "14px" }}>
              This opens your default mail app with a pre-filled email — no data is sent to any server.
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowEmailPrompt(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => sendConfirmationEmail(userEmail, applications)} disabled={!userEmail.includes("@")}>
                ✉ Open Email Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      {jobs.length > 0 && (
        <div className="card" style={{ marginBottom: "14px", background: "#0a1628", border: "1px solid #1e3f5a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "13px", color: "#7dd3fc", fontWeight: "600" }}>🔽 Filter Jobs</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#475569" }}>Showing <strong style={{ color: "#e2e8f0" }}>{filteredJobs.length}</strong> of {jobs.length}</span>
              <button onClick={() => { setExpLevel("All"); setJobType("All"); setEasyApply(false); }} style={{ background: "none", border: "1px solid #1e293b", color: "#64748b", padding: "3px 10px", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "11px" }}>Reset</button>
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Experience Level</div>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
              {EXP_OPTIONS.map(o => <FilterChip key={o} label={o} value={o} current={expLevel} onSelect={setExpLevel} color="#818cf8" />)}
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Work Type</div>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
              {TYPE_OPTIONS.map(o => <FilterChip key={o} label={o} value={o} current={jobType} onSelect={setJobType} color="#38bdf8" />)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setEasyApply(!easyApply)}
              style={{ padding: "6px 16px", border: `1px solid ${easyApply ? "#22c55e" : "#1e293b"}`, borderRadius: "20px", background: easyApply ? "#064e3b" : "transparent", color: easyApply ? "#4ade80" : "#64748b", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "12px", transition: "all 0.15s" }}>
              {easyApply ? "✓ Easy Apply ON" : "⚡ Easy Apply Only"}
            </button>
            <span style={{ fontSize: "11px", color: "#475569" }}>Shows only jobs with a direct apply link</span>
          </div>
        </div>
      )}

      {/* ── JOB CARDS ── */}
      {jobs.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>
              🎯 {filteredJobs.length} Jobs
              {expLevel !== "All" && <span style={{ fontSize: "12px", color: "#818cf8", marginLeft: "8px" }}>· {expLevel}</span>}
              {jobType !== "All" && <span style={{ fontSize: "12px", color: "#38bdf8", marginLeft: "6px" }}>· {jobType}</span>}
              {easyApply && <span style={{ fontSize: "12px", color: "#4ade80", marginLeft: "6px" }}>· Easy Apply</span>}
            </div>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 12px" }} onClick={onMatchAll} disabled={loadingMatch || !resume}>
              {loadingMatch ? <><span className="spinner" /></> : "⬡ Score All"}
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "36px" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🔍</div>
              <div style={{ fontSize: "13px", color: "#475569" }}>No jobs match this filter. Try adjusting above.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: "10px" }}>
                {displayed.map(job => (
                  <div key={job.id} className="job-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>
                          <span className="portal-badge" style={{ background: job.portalColor || "#6366f1", fontSize: "10px" }}>{job.portal}</span>
                          {job.fresherFriendly && <span style={{ background: "#064e3b", color: "#4ade80", border: "1px solid #166534", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>🎓 Fresher</span>}
                          {job.type && <span style={{ background: "#0d1f35", color: "#7dd3fc", border: "1px solid #1e3f5a", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>{job.type}</span>}
                          {job.url && <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #166534", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>⚡ Easy Apply</span>}
                          {job.applied && <span style={{ color: "#4ade80", fontSize: "10px", fontWeight: "600" }}>✓ Applied</span>}
                        </div>
                        <div style={{ fontSize: "15px", color: "#f1f5f9", fontFamily: "'Syne',sans-serif", fontWeight: "700", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>{job.company} · {job.location}{job.salary && job.salary !== "Not specified" ? ` · ${job.salary}` : ""}</div>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {(job.tags || []).slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                        {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc", marginTop: "5px" }}>⬡ {job.matchReason}</div>}
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "7px" }}>
                        {job.match != null ? (
                          <div style={{ textAlign: "right" }}>
                            <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44`, display: "block", textAlign: "center", marginBottom: "4px" }}>{job.match}%</div>
                            <div className="progress-bar" style={{ width: "70px" }}><div className="progress-fill" style={{ width: `${job.match}%`, background: matchColor(job.match) }} /></div>
                          </div>
                        ) : <span style={{ fontSize: "10px", color: "#334155" }}>Not scored</span>}
                        <div style={{ display: "flex", gap: "6px" }}>
                          {job.url && !job.applied && <a href={job.url} target="_blank" rel="noreferrer"><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "11px" }}>↗</button></a>}
                          {!job.applied
                            ? <button className="btn btn-success" style={{ padding: "5px 12px", fontSize: "11px" }} onClick={() => onApply(job)}>Apply</button>
                            : <span style={{ fontSize: "10px", color: "#4ade80" }}>✓ Done</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredJobs.length > 8 && (
                <button className="btn btn-ghost" style={{ width: "100%", marginTop: "12px", justifyContent: "center" }} onClick={() => setShowAll(!showAll)}>
                  {showAll ? "▲ Show Less" : `▼ Show All ${filteredJobs.length} Jobs`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
