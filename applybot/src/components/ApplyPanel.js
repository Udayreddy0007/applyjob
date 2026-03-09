export default function ApplyPanel({ job, resume, enhancedResume, setEnhancedResume, coverLetter, setCoverLetter, loadingApply, onSubmit, onEnhance, onClose }) {
  if (!job) return null;
  const hasEnhanced = enhancedResume && enhancedResume.trim().length > 100;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "800", color: "#f1f5f9" }}>Apply: {job.title}</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{job.company} · {job.portal} · {job.location}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={onClose}>✕</button>
        </div>

        {/* Status check */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div style={{ padding: "12px", background: resume ? "#064e3b" : "#1a0a0a", border: `1px solid ${resume ? "#166534" : "#3b1010"}`, borderRadius: "8px", fontSize: "12px", color: resume ? "#4ade80" : "#f87171" }}>
            {resume ? "✓ Resume ready" : "✗ No resume uploaded"}
          </div>
          <div style={{ padding: "12px", background: hasEnhanced ? "#064e3b" : "#0d1f35", border: `1px solid ${hasEnhanced ? "#166534" : "#1e3f5a"}`, borderRadius: "8px", fontSize: "12px", color: hasEnhanced ? "#4ade80" : "#7dd3fc" }}>
            {hasEnhanced ? "✓ Resume enhanced for this role" : "⬡ Using original resume"}
          </div>
        </div>

        {!hasEnhanced && (
          <div style={{ background: "#1a2e0f", border: "1px solid #2d4a1a", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px", color: "#86efac", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⬡ Tip: Enhance your resume for this role to improve your chances.</span>
            <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "11px", marginLeft: "10px" }} onClick={onEnhance}>Enhance Now</button>
          </div>
        )}

        <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {hasEnhanced ? "Enhanced Resume (AI Optimized)" : "Resume"}
            </div>
            <textarea rows={8} value={enhancedResume || resume} onChange={(e) => setEnhancedResume(e.target.value)} placeholder="Your resume..." />
          </div>
          {coverLetter && (
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cover Letter</div>
              <textarea rows={5} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            </div>
          )}
        </div>

        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px", color: "#7dd3fc" }}>
          ⚡ Clicking "Apply Now" will open the job listing in a new tab and record this application in your Tracker.
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={onSubmit} disabled={loadingApply || !resume}>
            {loadingApply ? <><span className="spinner" /> Applying...</> : `⚡ Apply Now → ${job.portal}`}
          </button>
        </div>
      </div>
    </div>
  );
}
