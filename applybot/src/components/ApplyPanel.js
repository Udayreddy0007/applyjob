import { useState } from "react";

export default function ApplyPanel({ job, resume, enhancedResume, setEnhancedResume, coverLetter, setCoverLetter, loadingApply, onSubmit, onEnhance, onClose }) {
  const [userEmail, setUserEmail] = useState("");
  const [applied, setApplied] = useState(false);
  const [appliedAt] = useState(new Date().toLocaleString());

  if (!job) return null;
  const hasEnhanced = enhancedResume && enhancedResume.trim().length > 100;

  async function handleApply() {
    await onSubmit();
    setApplied(true);
  }

  function sendEmail() {
    if (!userEmail.includes("@")) return;
    const subject = `ApplyBot – Applied to ${job.title} at ${job.company}`;
    const body = `Hi,

You applied to the following job via ApplyBot:

Job Title: ${job.title}
Company:   ${job.company}
Portal:    ${job.portal}
Location:  ${job.location}
Applied:   ${appliedAt}
Job Link:  ${job.url || "N/A"}

${coverLetter ? "Cover Letter Used:\n" + coverLetter + "\n\n" : ""}Good luck with your application!
– ApplyBot`;
    window.open(`mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }

  if (applied) {
    return (
      <div className="panel-overlay" onClick={onClose}>
        <div className="panel" style={{ maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
          {/* Success */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "22px", fontWeight: "800", color: "#4ade80", marginBottom: "6px" }}>Application Submitted!</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>You applied to <strong style={{ color: "#e2e8f0" }}>{job.title}</strong> at <strong style={{ color: "#e2e8f0" }}>{job.company}</strong></div>
          </div>

          {/* Receipt */}
          <div style={{ background: "#080c14", border: "1px solid #1e293b", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Application Receipt</div>
            {[
              ["Job Title", job.title],
              ["Company", job.company],
              ["Portal", job.portal],
              ["Location", job.location],
              ["Applied At", appliedAt],
              ["Job URL", job.url ? "Opened in new tab ↗" : "N/A"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: "12px", color: "#e2e8f0", textAlign: "right", wordBreak: "break-word" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Email confirmation */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "#7dd3fc", marginBottom: "8px", fontWeight: "600" }}>✉ Get email confirmation</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="email" placeholder="your@email.com" value={userEmail} onChange={e => setUserEmail(e.target.value)}
                style={{ flex: 1, background: "#080c14", border: "1px solid #1e293b", borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontFamily: "'DM Mono',monospace", fontSize: "12px", outline: "none" }} />
              <button className="btn btn-primary" style={{ padding: "9px 16px", fontSize: "12px" }} onClick={sendEmail} disabled={!userEmail.includes("@")}>
                Send ✉
              </button>
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>Opens your mail app with a pre-filled confirmation email.</div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {job.url && <a href={job.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>↗ View Job Page</button>
            </a>}
            <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Done ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: "800", color: "#f1f5f9" }}>Apply: {job.title}</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{job.company} · {job.portal} · {job.location}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={onClose}>✕</button>
        </div>

        {/* Status checks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <div style={{ padding: "10px 12px", background: resume ? "#061a0e" : "#1a0808", border: `1px solid ${resume ? "#166534" : "#3b1010"}`, borderRadius: "8px", fontSize: "12px", color: resume ? "#4ade80" : "#f87171" }}>
            {resume ? "✓ Resume ready" : "✗ No resume"}
          </div>
          <div style={{ padding: "10px 12px", background: hasEnhanced ? "#061a0e" : "#0d1f35", border: `1px solid ${hasEnhanced ? "#166534" : "#1e3f5a"}`, borderRadius: "8px", fontSize: "12px", color: hasEnhanced ? "#4ade80" : "#7dd3fc" }}>
            {hasEnhanced ? "✓ Resume enhanced" : "⬡ Original resume"}
          </div>
        </div>

        {!hasEnhanced && (
          <div style={{ background: "#0d1f1a", border: "1px solid #166534", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#4ade80", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Tip: Enhance your resume first to increase your chances.</span>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "4px 10px", marginLeft: "8px" }} onClick={onEnhance}>Enhance →</button>
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{hasEnhanced ? "Enhanced Resume" : "Resume"}</div>
          <textarea rows={7} value={enhancedResume || resume} onChange={e => setEnhancedResume(e.target.value)} />
        </div>

        {coverLetter && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cover Letter</div>
            <textarea rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
          </div>
        )}

        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#7dd3fc" }}>
          ⚡ Clicking Apply will open the job page in a new tab, record your application in Tracker, and show a confirmation with email option.
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleApply} disabled={loadingApply || !resume}>
            {loadingApply ? <><span className="spinner" /> Applying...</> : `⚡ Apply to ${job.portal} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
