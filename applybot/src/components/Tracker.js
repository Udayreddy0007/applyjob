import { matchColor } from "../styles/theme";

export default function Tracker({ jobs, onBrowse }) {
  const applied = jobs.filter((j) => j.applied);

  if (applied.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="section-title">Applications Tracker</div>
        <div className="card" style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <div style={{ fontSize: "14px", color: "#64748b" }}>No applications yet.</div>
          <div style={{ fontSize: "12px", color: "#475569", marginTop: "6px" }}>Head to the Job Board to start applying!</div>
          <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={onBrowse}>Browse Jobs</button>
        </div>
      </div>
    );
  }

  const portalsUsed = [...new Set(applied.map((j) => j.portal))];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="section-title">Applications Tracker</div>
      <div style={{ display: "grid", gap: "12px" }}>
        {applied.map((job) => (
          <div key={job.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="portal-badge" style={{ background: job.portalColor, fontSize: "10px", display: "inline-block", marginBottom: "8px" }}>{job.portal}</span>
                <div style={{ fontSize: "15px", color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontWeight: "700" }}>{job.title}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>{job.company} · {job.location}</div>
                <div style={{ fontSize: "11px", color: "#475569" }}>Applied: {job.appliedAt}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", background: "#064e3b", border: "1px solid #166534", borderRadius: "20px", color: "#4ade80", fontSize: "12px" }}>
                  <span className="status-dot" style={{ background: "#4ade80" }} />
                  {job.status}
                </div>
                {job.match && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: matchColor(job.match) }}>{job.match}% match</div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "8px", padding: "14px", background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "10px", fontSize: "12px", color: "#7dd3fc" }}>
          ⬡ {applied.length} application{applied.length !== 1 ? "s" : ""} submitted across {portalsUsed.join(", ")}.
        </div>
      </div>
    </div>
  );
}
