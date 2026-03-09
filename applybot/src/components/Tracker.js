import { useState } from "react";
import { matchColor } from "../styles/theme";

const STATUS_OPTIONS = ["Applied", "Interviewing", "Offer Received", "Rejected", "Withdrawn"];

const STATUS_COLORS = {
  "Applied": { bg: "#064e3b", color: "#4ade80", border: "#166534" },
  "Interviewing": { bg: "#1e3a5f", color: "#60a5fa", border: "#1d4ed8" },
  "Offer Received": { bg: "#3b1f00", color: "#fbbf24", border: "#92400e" },
  "Rejected": { bg: "#450a0a", color: "#f87171", border: "#7f1d1d" },
  "Withdrawn": { bg: "#1e1e2e", color: "#94a3b8", border: "#334155" },
};

export default function Tracker({ applications, setApplications, onBrowse }) {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  function updateStatus(id, status) {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  function removeApplication(id) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  const stats = {
    total: applications.length,
    interviewing: applications.filter((a) => a.status === "Interviewing").length,
    offers: applications.filter((a) => a.status === "Offer Received").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  if (applications.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="section-title">Application Tracker</div>
        <div className="card" style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <div style={{ fontSize: "15px", color: "#94a3b8", marginBottom: "8px" }}>No applications yet.</div>
          <div style={{ fontSize: "12px", color: "#475569", marginBottom: "20px" }}>
            Apply to jobs from the Job Board and they'll appear here automatically.
          </div>
          <button className="btn btn-primary" onClick={onBrowse}>⬡ Browse Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="section-title">Application Tracker</div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Applied", val: stats.total, color: "#38bdf8" },
          { label: "Interviewing", val: stats.interviewing, color: "#60a5fa" },
          { label: "Offers", val: stats.offers, color: "#fbbf24" },
          { label: "Rejected", val: stats.rejected, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ background: s.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "30px" }}>{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button key={s} className={`filter-btn${filter === s ? " active" : ""}`} onClick={() => setFilter(s)} style={{ fontSize: "11px" }}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "13px", color: "#475569" }}>No applications with status "{filter}".</div>
        </div>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {filtered.map((app) => {
          const sc = STATUS_COLORS[app.status] || STATUS_COLORS["Applied"];
          return (
            <div key={app.id} className="card" style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span className="portal-badge" style={{ background: app.portalColor || "#6366f1", fontSize: "10px" }}>{app.portal}</span>
                    <span style={{ fontSize: "11px", color: "#475569" }}>{app.appliedAt}</span>
                  </div>
                  <div style={{ fontSize: "15px", color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>{app.jobTitle}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{app.company} · {app.location}</div>
                  {app.salary && app.salary !== "Not specified" && (
                    <div style={{ fontSize: "11px", color: "#7dd3fc", marginTop: "4px" }}>{app.salary}</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "20px", color: sc.color, fontSize: "11px", fontWeight: "600" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.color, marginRight: "6px", display: "inline-block" }} />
                    {app.status}
                  </div>
                  {app.match != null && (
                    <div style={{ fontSize: "11px", color: matchColor(app.match) }}>{app.match}% match</div>
                  )}
                </div>
              </div>

              {/* Expanded */}
              {expanded === app.id && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>

                  {/* Update Status */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Update Status</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {STATUS_OPTIONS.map((s) => {
                        const c = STATUS_COLORS[s];
                        return (
                          <button key={s} onClick={() => updateStatus(app.id, s)}
                            style={{ padding: "5px 12px", border: `1px solid ${app.status === s ? c.border : "#1e293b"}`, borderRadius: "20px", background: app.status === s ? c.bg : "transparent", color: app.status === s ? c.color : "#64748b", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {app.coverLetterUsed && (
                    <div style={{ marginBottom: "14px" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cover Letter Used</div>
                      <div style={{ background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.7", maxHeight: "120px", overflowY: "auto" }}>
                        {app.coverLetterUsed}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {app.url && (
                      <a href={app.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "11px" }}>↗ View Job</button>
                      </a>
                    )}
                    <button className="btn btn-danger" style={{ padding: "6px 14px", fontSize: "11px" }} onClick={() => removeApplication(app.id)}>✕ Remove</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
