import { matchColor } from "../styles/theme";

export default function AIEnhancer({
  jobs, resume,
  selectedJob, setSelectedJob,
  enhancedResume, setEnhancedResume,
  coverLetter, setCoverLetter,
  loadingEnhance, onEnhance, onApply,
}) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="section-title">AI Resume Enhancer</div>
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
        Select a job to tailor your resume and generate a cover letter using AI.
      </p>

      {!resume && (
        <div style={{ background: "#0d1f35", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "16px 18px", marginBottom: "20px", fontSize: "12px", color: "#7dd3fc" }}>
          ⬡ Upload your resume in the Dashboard first.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        {/* Job List */}
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Select Job</div>
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`job-card${selectedJob?.id === job.id ? " selected" : ""}`}
              style={{ padding: "14px", marginBottom: "10px" }}
              onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
            >
              <span className="portal-badge" style={{ background: job.portalColor, fontSize: "10px", display: "inline-block", marginBottom: "6px" }}>{job.portal}</span>
              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500", marginBottom: "2px" }}>{job.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{job.company}</div>
              {job.match != null && (
                <div style={{ fontSize: "11px", color: matchColor(job.match), marginTop: "6px" }}>{job.match}% match</div>
              )}
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div>
          {selectedJob ? (
            <>
              <div className="card" style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "500" }}>{selectedJob.title}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{selectedJob.company} · {selectedJob.portal}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => onEnhance(selectedJob)} disabled={loadingEnhance || !resume}>
                    {loadingEnhance ? <><span className="spinner" /> Enhancing...</> : "⬡ Enhance & Generate"}
                  </button>
                </div>
              </div>

              {enhancedResume || coverLetter ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {enhancedResume && (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ fontSize: "13px", color: "#7dd3fc", fontWeight: "500" }}>Enhanced Resume</div>
                        <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "11px" }} onClick={() => navigator.clipboard.writeText(enhancedResume)}>Copy</button>
                      </div>
                      <textarea rows={12} value={enhancedResume} onChange={(e) => setEnhancedResume(e.target.value)} />
                    </div>
                  )}
                  {coverLetter && (
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ fontSize: "13px", color: "#7dd3fc", fontWeight: "500" }}>Cover Letter</div>
                        <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "11px" }} onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy</button>
                      </div>
                      <textarea rows={10} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                    </div>
                  )}
                  <button className="btn btn-success" style={{ alignSelf: "flex-start" }} onClick={() => onApply(selectedJob)}>
                    ⬡ Apply with Enhanced Resume
                  </button>
                </div>
              ) : (
                <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>⬡</div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    Click "Enhance & Generate" to tailor your resume<br />and create a custom cover letter for this role.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>←</div>
              <div style={{ fontSize: "13px", color: "#475569" }}>Select a job from the list to start enhancing your resume.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
