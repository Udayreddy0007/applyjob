import { matchColor } from "../styles/theme";

export default function AIEnhancer({
  jobs, resume,
  selectedJob, setSelectedJob,
  enhancedResume, setEnhancedResume,
  coverLetter, setCoverLetter,
  loadingEnhance, onEnhance, onApply,
}) {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="section-title">AI Resume Enhancer</div>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
        Select a job → AI rewrites your resume with the job's keywords, reorders your skills, and generates a tailored cover letter.
      </p>

      {!resume && (
        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", fontSize: "12px", color: "#7dd3fc" }}>
          ⬡ Upload your resume in the Dashboard first.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        {/* Job list */}
        <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Select a Job</div>
          {jobs.length === 0 && (
            <div style={{ fontSize: "12px", color: "#475569", padding: "20px 0" }}>No jobs loaded. Go to Dashboard → Find Jobs first.</div>
          )}
          {jobs.map((job) => (
            <div key={job.id}
              className={`job-card${selectedJob?.id === job.id ? " selected" : ""}`}
              style={{ padding: "14px", marginBottom: "10px" }}
              onClick={() => { setSelectedJob(job); setEnhancedResume(""); setCoverLetter(""); }}
            >
              <span className="portal-badge" style={{ background: job.portalColor || "#6366f1", fontSize: "10px", display: "inline-block", marginBottom: "6px" }}>{job.portal}</span>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500", marginBottom: "2px" }}>{job.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{job.company}</div>
              {job.match != null && <div style={{ fontSize: "11px", color: matchColor(job.match), marginTop: "4px" }}>⬡ {job.match}% match</div>}
              {job.applied && <div style={{ fontSize: "11px", color: "#4ade80", marginTop: "2px" }}>✓ Applied</div>}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div>
          {selectedJob ? (
            <>
              <div className="card" style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "15px", color: "#f1f5f9", fontWeight: "600" }}>{selectedJob.title}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{selectedJob.company} · {selectedJob.portal}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => onEnhance(selectedJob)} disabled={loadingEnhance || !resume}>
                    {loadingEnhance ? <><span className="spinner" /> Enhancing...</> : "⬡ Enhance Resume + Generate Cover Letter"}
                  </button>
                </div>
              </div>

              {loadingEnhance && (
                <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>⚙️</div>
                  <div style={{ fontSize: "13px", color: "#7dd3fc", marginBottom: "6px" }}>AI is enhancing your resume...</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>Rewriting bullet points, adding keywords, optimizing for ATS</div>
                </div>
              )}

              {!loadingEnhance && (enhancedResume || coverLetter) && (
                <div style={{ display: "grid", gap: "16px" }}>
                  {enhancedResume && (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <div style={{ fontSize: "13px", color: "#7dd3fc", fontWeight: "600" }}>✅ Enhanced Resume</div>
                          <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Tailored for {selectedJob.title} · ATS optimized</div>
                        </div>
                        <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "11px" }} onClick={() => { navigator.clipboard.writeText(enhancedResume); }}>Copy</button>
                      </div>
                      <textarea rows={14} value={enhancedResume} onChange={(e) => setEnhancedResume(e.target.value)}
                        style={{ fontSize: "12px", lineHeight: "1.7" }} />
                    </div>
                  )}

                  {coverLetter && (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <div style={{ fontSize: "13px", color: "#7dd3fc", fontWeight: "600" }}>✅ Cover Letter</div>
                          <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Personalized for {selectedJob.company}</div>
                        </div>
                        <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "11px" }} onClick={() => { navigator.clipboard.writeText(coverLetter); }}>Copy</button>
                      </div>
                      <textarea rows={8} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-success" onClick={() => onApply(selectedJob)}>⚡ Apply with Enhanced Resume</button>
                    <button className="btn btn-ghost" onClick={() => { setEnhancedResume(""); setCoverLetter(""); }}>↺ Re-enhance</button>
                  </div>
                </div>
              )}

              {!loadingEnhance && !enhancedResume && !coverLetter && (
                <div className="card" style={{ textAlign: "center", padding: "50px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>✨</div>
                  <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "6px" }}>Ready to enhance your resume</div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    Click "Enhance Resume" to tailor your resume for <strong style={{ color: "#7dd3fc" }}>{selectedJob.title}</strong>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👈</div>
              <div style={{ fontSize: "13px", color: "#475569" }}>Select a job from the list to enhance your resume for it.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
