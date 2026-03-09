import { useState } from "react";
import { matchColor } from "../styles/theme";

const EXP_OPTIONS = ["All", "Entry Level", "Internship", "Full-time", "Part-time"];
const TYPE_OPTIONS = ["All", "Remote", "Hybrid", "On-site"];

function FilterChip({ label, value, current, onSelect, color }) {
  return (
    <button onClick={() => onSelect(value === current ? "All" : value)}
      style={{
        padding: "6px 14px", borderRadius: "20px", border: "1px solid",
        borderColor: current === value ? color : "#1e293b",
        background: current === value ? color + "22" : "transparent",
        color: current === value ? color : "#64748b",
        cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "12px",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}>{label}</button>
  );
}

export default function JobBoard({ jobs, resume, loadingJobs, loadingMatch, onFetchJobs, onMatchAll, onApply, onEnhance, onCustomSearch }) {
  const [expLevel, setExpLevel] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [easyApply, setEasyApply] = useState(false);
  const [textSearch, setTextSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [portalFilter, setPortalFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const portals = ["All", ...new Set(jobs.map(j => j.portal))];
  const fresherCount = jobs.filter(j => j.fresherFriendly).length;

  const filtered = jobs.filter(j => {
    // Text search
    if (textSearch) {
      const q = textSearch.toLowerCase();
      const hit = (j.title || "").toLowerCase().includes(q) ||
        (j.company || "").toLowerCase().includes(q) ||
        (j.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (j.location || "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    // Portal
    if (portalFilter !== "All" && j.portal !== portalFilter) return false;
    // Exp level
    if (expLevel !== "All") {
      const text = ((j.title || "") + " " + (j.description || "") + " " + (j.type || "")).toLowerCase();
      if (expLevel === "Entry Level" && !["junior","entry","entry-level","graduate","fresher","trainee","associate","new grad"].some(k => text.includes(k))) return false;
      if (expLevel === "Internship" && !["intern","internship","trainee","apprentice"].some(k => text.includes(k))) return false;
      if (expLevel === "Full-time" && !(j.type || "").toLowerCase().includes("full")) return false;
      if (expLevel === "Part-time" && !(j.type || "").toLowerCase().includes("part")) return false;
    }
    // Work type
    if (jobType !== "All") {
      const loc = ((j.location || "") + " " + (j.type || "")).toLowerCase();
      if (jobType === "Remote" && !loc.includes("remote")) return false;
      if (jobType === "Hybrid" && !loc.includes("hybrid")) return false;
      if (jobType === "On-site" && loc.includes("remote")) return false;
    }
    // Easy apply
    if (easyApply && !j.url) return false;
    return true;
  });

  function handleCustomSearch(e) {
    e.preventDefault();
    if (!customInput.trim()) return;
    onCustomSearch(customInput.trim());
    setCustomInput("");
  }

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          Job Board <span style={{ color: "#475569", fontSize: "13px", fontWeight: "400" }}>({filtered.length}/{jobs.length})</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary" style={{ fontSize: "12px", padding: "7px 14px" }} onClick={onFetchJobs} disabled={loadingJobs || !resume}>
            {loadingJobs ? <><span className="spinner" /> Finding...</> : "⬡ Find From Resume"}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "12px", padding: "7px 14px" }} onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0}>
            {loadingMatch ? <><span className="spinner" /> Scoring...</> : "⬡ Score All"}
          </button>
        </div>
      </div>

      {/* Custom search box */}
      <div className="card" style={{ marginBottom: "14px", background: "#0a1628", border: "1px solid #1e3f5a" }}>
        <div style={{ fontSize: "12px", color: "#7dd3fc", marginBottom: "10px", fontWeight: "600" }}>🔍 Search Any Job Role</div>
        <form onSubmit={handleCustomSearch} style={{ display: "flex", gap: "10px" }}>
          <input type="text" placeholder="e.g. React Developer, Data Analyst, Python Intern, UI Designer..." value={customInput} onChange={e => setCustomInput(e.target.value)}
            style={{ flex: 1, background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", color: "#e2e8f0", fontFamily: "'DM Mono',monospace", fontSize: "13px", outline: "none" }} />
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }} disabled={loadingJobs || !customInput.trim()}>
            {loadingJobs ? <><span className="spinner" /></> : "Search →"}
          </button>
        </form>
        <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["React Intern","Python Junior","Data Analyst","UI/UX Designer","Java Fresher","Node.js","Marketing Intern","ML Engineer","QA Tester","Business Analyst"].map(s => (
            <button key={s} onClick={() => onCustomSearch(s)} disabled={loadingJobs}
              style={{ background: "#0d1f35", border: "1px solid #1e3f5a", color: "#64748b", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="card" style={{ marginBottom: "14px", background: "#0a1628", border: "1px solid #1e3f5a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "12px", color: "#7dd3fc", fontWeight: "600" }}>🔽 Filters</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {fresherCount > 0 && (
              <span style={{ fontSize: "11px", color: "#4ade80", background: "#064e3b", border: "1px solid #166534", padding: "3px 10px", borderRadius: "20px" }}>
                🎓 {fresherCount} fresher-friendly
              </span>
            )}
            <button onClick={() => { setExpLevel("All"); setJobType("All"); setEasyApply(false); setTextSearch(""); setPortalFilter("All"); }}
              style={{ background: "none", border: "1px solid #1e293b", color: "#64748b", padding: "3px 10px", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "11px" }}>
              Reset All
            </button>
          </div>
        </div>

        {/* Text filter */}
        <input type="text" placeholder="Filter by title, company, skill or location..." value={textSearch} onChange={e => setTextSearch(e.target.value)}
          style={{ width: "100%", background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "9px 14px", color: "#e2e8f0", fontFamily: "'DM Mono',monospace", fontSize: "12px", outline: "none", marginBottom: "12px" }} />

        {/* Experience level */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Experience Level</div>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {EXP_OPTIONS.map(o => <FilterChip key={o} label={o} value={o} current={expLevel} onSelect={setExpLevel} color="#818cf8" />)}
          </div>
        </div>

        {/* Work type */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Work Type</div>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {TYPE_OPTIONS.map(o => <FilterChip key={o} label={o} value={o} current={jobType} onSelect={setJobType} color="#38bdf8" />)}
          </div>
        </div>

        {/* Easy Apply */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setEasyApply(!easyApply)}
            style={{ padding: "6px 16px", border: `1px solid ${easyApply ? "#22c55e" : "#1e293b"}`, borderRadius: "20px", background: easyApply ? "#064e3b" : "transparent", color: easyApply ? "#4ade80" : "#64748b", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: "12px", transition: "all 0.15s" }}>
            {easyApply ? "✓ Easy Apply ON" : "⚡ Easy Apply Only"}
          </button>
          <span style={{ fontSize: "11px", color: "#475569" }}>Direct apply links only</span>
        </div>
      </div>

      {/* Portal scroll filter */}
      {portals.length > 1 && (
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "16px" }}>
          {portals.map(p => (
            <button key={p} className={`filter-btn${portalFilter === p ? " active" : ""}`} onClick={() => setPortalFilter(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Empty states */}
      {jobs.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "6px" }}>No jobs yet.</div>
          <div style={{ fontSize: "12px", color: "#475569", marginBottom: "16px" }}>Search above or go to Dashboard → Find Matching Jobs.</div>
        </div>
      )}
      {filtered.length === 0 && jobs.length > 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>😕</div>
          <div style={{ fontSize: "13px", color: "#475569" }}>No jobs match these filters. Try resetting.</div>
          <button className="btn btn-ghost" style={{ marginTop: "12px" }} onClick={() => { setExpLevel("All"); setJobType("All"); setEasyApply(false); setTextSearch(""); setPortalFilter("All"); }}>Reset Filters</button>
        </div>
      )}

      {/* Job cards */}
      <div style={{ display: "grid", gap: "12px" }}>
        {filtered.map(job => (
          <div key={job.id} className={`job-card${selectedId === job.id ? " selected" : ""}`} onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span className="portal-badge" style={{ background: job.portalColor || "#6366f1" }}>{job.portal}</span>
                  {job.fresherFriendly && <span style={{ background: "#064e3b", color: "#4ade80", border: "1px solid #166534", padding: "2px 7px", borderRadius: "20px", fontSize: "10px", fontWeight: "600" }}>🎓 Fresher</span>}
                  {job.type && <span style={{ background: "#0d1f35", color: "#7dd3fc", border: "1px solid #1e3f5a", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>{job.type}</span>}
                  {job.url && <span style={{ background: "#064e3b", color: "#4ade80", border: "1px solid #166534", padding: "2px 7px", borderRadius: "20px", fontSize: "10px" }}>⚡ Easy Apply</span>}
                  {job.applied && <span style={{ color: "#4ade80", fontSize: "10px" }}>✓ Applied</span>}
                  <span style={{ fontSize: "10px", color: "#475569", marginLeft: "auto" }}>{job.posted}</span>
                </div>
                <div style={{ fontSize: "15px", color: "#f1f5f9", fontFamily: "'Syne',sans-serif", fontWeight: "700", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>{job.company} · {job.location}{job.salary && job.salary !== "Not specified" ? ` · ${job.salary}` : ""}</div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {(job.tags || []).slice(0, 5).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {job.match != null ? (
                  <div>
                    <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44`, display: "inline-block", marginBottom: "5px" }}>{job.match}%</div>
                    <div className="progress-bar" style={{ width: "75px" }}><div className="progress-fill" style={{ width: `${job.match}%`, background: matchColor(job.match) }} /></div>
                  </div>
                ) : <div style={{ fontSize: "10px", color: "#334155" }}>Not scored</div>}
              </div>
            </div>

            {/* Expanded detail */}
            {selectedId === job.id && (
              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: "1.8", marginBottom: "14px", maxHeight: "180px", overflowY: "auto" }}>
                  {job.description || "No description available."}
                </div>
                {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc", background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "6px", padding: "8px 12px", marginBottom: "7px" }}>⬡ {job.matchReason}</div>}
                {job.matchingSkills?.length > 0 && <div style={{ fontSize: "11px", color: "#4ade80", background: "#061a0e", border: "1px solid #166534", borderRadius: "6px", padding: "8px 12px", marginBottom: "7px" }}>✓ You have: {job.matchingSkills.join(", ")}</div>}
                {job.missingSkills?.length > 0 && <div style={{ fontSize: "11px", color: "#f87171", background: "#1f0a0a", border: "1px solid #3b1212", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px" }}>⚠ Missing: {job.missingSkills.join(", ")}</div>}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {!job.applied ? (
                    <>
                      <button className="btn btn-success" onClick={e => { e.stopPropagation(); onApply(job); }}>⚡ Apply Now</button>
                      <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); onEnhance(job); }}>⬡ Enhance Resume</button>
                      {job.url && <a href={job.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}><button className="btn btn-ghost">↗ View Job</button></a>}
                    </>
                  ) : <span style={{ fontSize: "12px", color: "#4ade80" }}>✓ Applied on {job.appliedAt}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
