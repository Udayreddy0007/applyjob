import { useState } from "react";
import { matchColor } from "../styles/theme";
import { PORTALS } from "../data/jobs";

export default function JobBoard({ jobs, resume, onApply, onEnhance }) {
  const [portalFilter, setPortalFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = jobs.filter((j) => portalFilter === "All" || j.portal === portalFilter);
  const selected = jobs.find((j) => j.id === selectedId);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          Job Board <span style={{ color: "#475569", fontSize: "13px", fontWeight: "400" }}>({filtered.length} listings)</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {PORTALS.map((p) => (
            <button key={p} className={`filter-btn${portalFilter === p ? " active" : ""}`} onClick={() => setPortalFilter(p)}>{p}</button>
          ))}
        </div>
      </div>

      {!resume && (
        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", fontSize: "12px", color: "#7dd3fc" }}>
          ⬡ Upload your resume in Dashboard to see match scores and apply to jobs.
        </div>
      )}

      <div style={{ display: "grid", gap: "14px" }}>
        {filtered.map((job) => (
          <div key={job.id} className={`job-card${selectedId === job.id ? " selected" : ""}`} onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span className="portal-badge" style={{ background: job.portalColor }}>{job.portal}</span>
                  <span style={{ fontSize: "11px", color: "#475569" }}>{job.posted}</span>
                  {job.applied && <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ Applied</span>}
                </div>
                <div style={{ fontSize: "16px", color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontWeight: "700", marginBottom: "2px" }}>{job.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>{job.company} · {job.location} · {job.salary}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {job.tags.map((t) => <span key={t} className="tag">{t}</span>)}
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
                <div style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: "1.8", marginBottom: "16px" }}>{job.description}</div>
                {job.matchReason && (
                  <div style={{ fontSize: "11px", color: "#7dd3fc", background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "6px", padding: "8px 12px", marginBottom: "14px" }}>⬡ {job.matchReason}</div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  {!job.applied ? (
                    <>
                      <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); onApply(job); }}>⬡ Apply Now</button>
                      <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onEnhance(job); }}>⬡ Enhance Resume</button>
                    </>
                  ) : (
                    <div style={{ fontSize: "13px", color: "#4ade80" }}>✓ Application submitted · {job.appliedAt}</div>
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
