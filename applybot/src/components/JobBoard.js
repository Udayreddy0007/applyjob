import { useState } from "react";
import { matchColor } from "../styles/theme";

export default function JobBoard({ jobs, resume, loadingJobs, loadingMatch, onFetchJobs, onMatchAll, onApply, onEnhance }) {
  const [portalFilter, setPortalFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fresherOnly, setFresherOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const availablePortals = ["All", ...new Set(jobs.map((j) => j.portal))];

  const filtered = jobs.filter((j) => {
    const matchPortal = portalFilter === "All" || j.portal === portalFilter;
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchFresher = !fresherOnly || j.fresherFriendly;
    return matchPortal && matchSearch && matchFresher;
  });

  const fresherCount = jobs.filter((j) => j.fresherFriendly).length;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          Job Board <span style={{ color: "#475569", fontSize: "13px", fontWeight: "400" }}>({filtered.length} of {jobs.length})</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ fontSize: "12px", padding: "8px 16px" }} onClick={onFetchJobs} disabled={loadingJobs || !resume}>
            {loadingJobs ? <><span className="spinner" /> Finding...</> : "⬡ Find Jobs"}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "12px", padding: "8px 16px" }} onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0}>
            {loadingMatch ? <><span className="spinner" /> Scoring...</> : "⬡ Score All"}
          </button>
        </div>
      </div>

      {/* Search + Fresher toggle */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by title, company or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", background: "#0f1623", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: "13px", outline: "none" }}
        />
        <button
          onClick={() => setFresherOnly(!fresherOnly)}
          style={{
            padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "500",
            background: fresherOnly ? "#10b981" : "#0f1623",
            color: fresherOnly ? "#080c14" : "#64748b",
            border: `1px solid ${fresherOnly ? "#10b981" : "#1e293b"}`,
            transition: "all 0.2s",
          }}
        >
          🎓 Fresher Friendly {fresherCount > 0 ? `(${fresherCount})` : ""}
        </button>
      </div>

      {/* Portal filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {availablePortals.map((p) => (
          <button key={p} className={`filter-btn${portalFilter === p ? " active" : ""}`} onClick={() => setPortalFilter(p)} style={{ fontSize: "11px" }}>{p}</button>
        ))}
      </div>

      {!resume && (
        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", fontSize: "12px", color: "#7dd3fc" }}>
          ⬡ Upload your resume in Dashboard → click "Find Jobs For Me" to get personalized listings from 15+ portals.
        </div>
      )}

      {jobs.length === 0 && resume && (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>No jobs loaded yet.</div>
          <div style={{ fontSize: "12px", color: "#475569", marginBottom: "16px" }}>Click "Find Jobs" to fetch real listings from 15 portals based on your resume.</div>
          <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs}>
            {loadingJobs ? <><span className="spinner" /> Finding...</> : "⬡ Find Jobs For Me"}
          </button>
        </div>
      )}

      {filtered.length === 0 && jobs.length > 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>😕</div>
          <div style={{ fontSize: "13px", color: "#475569" }}>No jobs match your filter. Try clearing the search or toggling fresher filter.</div>
        </div>
      )}

      <div style={{ display: "grid", gap: "14px" }}>
        {filtered.map((job) => (
          <div key={job.id} className={`job-card${selectedId === job.id ? " selected" : ""}`} onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span className="portal-badge" style={{ background: job.portalColor || "#6366f1" }}>{job.portal}</span>
                  {job.fresherFriendly && (
                    <span style={{ background: "#064e3b", color: "#4ade80", border: "1px solid #166534", padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "600" }}>
                      🎓 Fresher
                    </span>
                  )}
                  <span style={{ fontSize: "11px", color: "#475569" }}>{job.posted}</span>
                  {job.applied && <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ Applied</span>}
                </div>
                <div style={{ fontSize: "16px", color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontWeight: "700", marginBottom: "2px" }}>{job.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                  {job.company} · {job.location}
                  {job.salary && job.salary !== "Not specified" ? ` · ${job.salary}` : ""}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(job.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {job.match != null ? (
                  <div>
                    <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44`, display: "inline-block", marginBottom: "6px" }}>
                      {job.match}% match
                    </div>
                    <div className="progress-bar" style={{ width: "80px" }}>
                      <div className="progress-fill" style={{ width: `${job.match}%`, background: matchColor(job.match) }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: "#475569" }}>Not scored</div>
                )}
              </div>
            </div>

            {selectedId === job.id && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: "1.8", marginBottom: "16px", maxHeight: "220px", overflowY: "auto" }}>
                  {job.description || "No description available."}
                </div>
                {job.matchReason && (
                  <div style={{ fontSize: "11px", color: "#7dd3fc", background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "6px", padding: "8px 12px", marginBottom: "8px" }}>
                    ⬡ {job.matchReason}
                  </div>
                )}
                {job.missingSkills?.length > 0 && (
                  <div style={{ fontSize: "11px", color: "#f87171", background: "#1f0a0a", border: "1px solid #3b1212", borderRadius: "6px", padding: "8px 12px", marginBottom: "14px" }}>
                    ⚠ Missing skills: {job.missingSkills.join(", ")}
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {!job.applied ? (
                    <>
                      <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); onApply(job); }}>⬡ Apply Now</button>
                      <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onEnhance(job); }}>⬡ Enhance Resume</button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-ghost">⬡ View Listing ↗</button>
                        </a>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: "13px", color: "#4ade80" }}>✓ Applied · {job.appliedAt}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
