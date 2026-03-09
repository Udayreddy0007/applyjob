import { useRef, useState } from "react";
import { matchColor } from "../styles/theme";

export default function Dashboard({
  resume, setResume, resumeFile, setResumeFile,
  jobs, applications, analysisResult, loadingAnalysis, loadingMatch, loadingJobs,
  onAnalyze, onFetchJobs, onMatchAll, onApply, onAutoApplyAll, autoApplying, showToast,
}) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const matchedJobs = jobs.filter((j) => j.match != null);
  const topMatches = [...matchedJobs].sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 4);
  const readyToAutoApply = jobs.filter((j) => j.match >= 60 && !j.applied).length;

  async function readFile(file) {
    setFileLoading(true);
    setResumeFile(file);
    try {
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "pdf") {
        // Read PDF as text using FileReader
        const text = await extractPDFText(file);
        if (text && text.trim().length > 30) {
          setResume(text);
          showToast(`✅ PDF resume loaded! (${text.length} chars)`);
        } else {
          // Fallback: use filename + ask user to paste
          setResume("");
          showToast("Could not extract PDF text. Please paste your resume in the text box below.", "error");
        }
      } else if (["txt", "md", "doc", "docx", "rtf"].includes(ext)) {
        const text = await file.text();
        setResume(text);
        showToast(`✅ Resume loaded! (${text.length} chars)`);
      } else {
        showToast("Unsupported file type. Please use PDF, TXT, or DOC.", "error");
      }
    } catch (e) {
      showToast("Could not read file. Please paste your resume below.", "error");
    }
    setFileLoading(false);
  }

  async function extractPDFText(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Try reading as text first (works for text-based PDFs)
          const text = e.target.result;
          // Extract readable text from PDF binary
          const matches = text.match(/\(([^)]+)\)/g) || [];
          const extracted = matches
            .map((m) => m.slice(1, -1))
            .filter((t) => t.length > 1 && /[a-zA-Z]/.test(t))
            .join(" ");
          if (extracted.length > 100) {
            resolve(extracted);
          } else {
            // Try reading as raw text
            const rawReader = new FileReader();
            rawReader.onload = (re) => {
              const raw = re.target.result || "";
              // Strip PDF binary noise and extract text
              const cleaned = raw
                .replace(/[^\x20-\x7E\n\r\t]/g, " ")
                .replace(/\s{3,}/g, "\n")
                .trim();
              resolve(cleaned.length > 50 ? cleaned : "");
            };
            rawReader.readAsText(file);
          }
        } catch {
          resolve("");
        }
      };
      reader.readAsBinaryString(file);
    });
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    if (file) readFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>
          Welcome to ApplyBot ⚡
        </div>
        <p style={{ color: "#64748b", fontSize: "13px" }}>Upload resume → AI finds matching jobs → Auto-applies → Tracks everything.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Jobs Loaded", val: jobs.length, icon: "◈" },
          { label: "Scored", val: matchedJobs.length, icon: "⬡" },
          { label: "Applied", val: applications.length, icon: "✓" },
          { label: "Ready to Apply", val: readyToAutoApply, icon: "⚡" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{s.icon}</div>
            <div className="stat-num">{s.val}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* STEP 1 — Upload */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">① Upload Your Resume</div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? "#38bdf8" : resume ? "#22c55e" : "#1e293b"}`,
            borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer",
            background: dragOver ? "#0d1f35" : resume ? "#061a0e" : "transparent",
            transition: "all 0.2s",
          }}
        >
          {fileLoading ? (
            <>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
              <div style={{ fontSize: "13px", color: "#7dd3fc" }}>Reading your resume...</div>
            </>
          ) : resume ? (
            <>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
              <div style={{ fontSize: "13px", color: "#4ade80", marginBottom: "4px" }}>
                ✓ {resumeFile?.name || "Resume loaded"}
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{resume.length} characters · Click to replace</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>⬆</div>
              <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "6px" }}>
                Click to upload or drag & drop your resume
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {["PDF", "TXT", "DOC", "DOCX", "MD"].map((ext) => (
                  <span key={ext} style={{ background: "#0d1f35", border: "1px solid #1e3f5a", color: "#7dd3fc", padding: "2px 10px", borderRadius: "20px", fontSize: "11px" }}>{ext}</span>
                ))}
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,.doc,.docx,.rtf"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        </div>

        {/* Always show paste box */}
        <div style={{ marginTop: "14px" }}>
          <div style={{ fontSize: "11px", color: "#475569", marginBottom: "6px" }}>
            {resume ? "✏️ Edit or paste resume here:" : "Or paste resume text directly:"}
          </div>
          <textarea
            rows={resume ? 5 : 8}
            placeholder="Paste your full resume here (name, skills, experience, education)..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>

        {resume && (
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ {resume.length} characters ready</span>
            <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "3px 10px" }}
              onClick={() => { setResume(""); setResumeFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* STEP 2 — Find Jobs */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">② Find Matching Jobs</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI reads your resume, extracts your role and skills, then searches <strong style={{ color: "#7dd3fc" }}>15 job portals</strong> for matching roles.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onFetchJobs} disabled={loadingJobs || !resume}>
            {loadingJobs ? <><span className="spinner" /> Finding Jobs...</> : "⬡ Find Matching Jobs"}
          </button>
          <button className="btn btn-ghost" onClick={onAnalyze} disabled={loadingAnalysis || !resume}>
            {loadingAnalysis ? <><span className="spinner" /> Analyzing...</> : "⬡ Analyze Resume"}
          </button>
        </div>
        {analysisResult && (
          <div style={{ marginTop: "16px", background: "#080c14", border: "1px solid #1e3f5a", borderRadius: "10px", padding: "16px", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
            {analysisResult}
          </div>
        )}
      </div>

      {/* STEP 3 — Score */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="section-title">③ Score & Match Jobs</div>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          AI scores each job against your resume and shows missing skills.
        </p>
        <button className="btn btn-primary" onClick={onMatchAll} disabled={loadingMatch || !resume || jobs.length === 0}>
          {loadingMatch ? <><span className="spinner" /> Scoring {jobs.length} jobs...</> : `⬡ Score All ${jobs.length} Jobs`}
        </button>
        {jobs.length === 0 && <div style={{ fontSize: "11px", color: "#475569", marginTop: "8px" }}>Find jobs first using step ②</div>}
      </div>

      {/* STEP 4 — Auto Apply */}
      {readyToAutoApply > 0 && (
        <div className="card" style={{ marginBottom: "14px", border: "1px solid #1e3f5a", background: "#0a1628" }}>
          <div className="section-title">④ Auto Apply</div>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
            <strong style={{ color: "#4ade80" }}>{readyToAutoApply} jobs</strong> with 60%+ match found. Auto-apply opens each job page and records your application.
          </p>
          <button className="btn btn-success" onClick={onAutoApplyAll} disabled={autoApplying}>
            {autoApplying ? <><span className="spinner" /> Auto-Applying...</> : `⚡ Auto Apply to ${readyToAutoApply} Jobs`}
          </button>
        </div>
      )}

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <div className="card">
          <div className="section-title">🏆 Top Matches</div>
          {topMatches.map((job) => (
            <div key={job.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{job.title}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "3px" }}>{job.company} · {job.portal}</div>
                {job.matchReason && <div style={{ fontSize: "11px", color: "#7dd3fc" }}>⬡ {job.matchReason}</div>}
                {job.missingSkills?.length > 0 && (
                  <div style={{ fontSize: "11px", color: "#f87171" }}>⚠ Missing: {job.missingSkills.slice(0, 3).join(", ")}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "12px" }}>
                <div className="score-badge" style={{ background: matchColor(job.match) + "22", color: matchColor(job.match), border: `1px solid ${matchColor(job.match)}44` }}>
                  {job.match}%
                </div>
                {job.applied
                  ? <span style={{ fontSize: "11px", color: "#4ade80" }}>✓ Applied</span>
                  : <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "11px" }} onClick={() => onApply(job)}>Apply</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
