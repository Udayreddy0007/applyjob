export default function ApplyPanel({ job, resume, enhancedResume, setEnhancedResume, coverLetter, setCoverLetter, loadingApply, onSubmit, onClose }) {
  if (!job) return null;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "800", color: "#f1f5f9" }}>Apply to {job.title}</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{job.company} · {job.portal} · {job.location}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Resume</div>
            <textarea
              rows={8}
              value={enhancedResume || resume}
              onChange={(e) => setEnhancedResume(e.target.value)}
              placeholder="Your resume content..."
            />
          </div>

          {coverLetter && (
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cover Letter</div>
              <textarea rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            </div>
          )}

          {!enhancedResume && resume && (
            <div style={{ background: "#1a2e0f", border: "1px solid #2d4a1a", borderRadius: "8px", padding: "12px 14px", fontSize: "12px", color: "#86efac" }}>
              ⬡ Tip: Use the AI Enhancer tab to tailor your resume for this role first.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={onSubmit} disabled={loadingApply || !resume}>
            {loadingApply ? <><span className="spinner" /> Submitting...</> : `⬡ Submit to ${job.portal}`}
          </button>
        </div>
      </div>
    </div>
  );
}
