import { useState } from "react";
import { GLOBAL_STYLES } from "../styles/theme";
import { analyzeResume, matchResumeToJob, enhanceResumeForJob, generateCoverLetter, extractJobKeywords } from "../api/claude";
import { fetchJobsFromAPI, extractKeywords } from "../api/jobs";
import Dashboard from "./Dashboard";
import JobBoard from "./JobBoard";
import AIEnhancer from "./AIEnhancer";
import Tracker from "./Tracker";
import ApplyPanel from "./ApplyPanel";

export default function JobApplierBot() {
  const [tab, setTab] = useState("dashboard");
  const [resume, setResume] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [enhancedResume, setEnhancedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingEnhance, setLoadingEnhance] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [toast, setToast] = useState(null);
  const [applyPanel, setApplyPanel] = useState(false);
  const [autoApplying, setAutoApplying] = useState(false);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  async function handleAnalyze() {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingAnalysis(true);
    setAnalysisResult("");
    try {
      const result = await analyzeResume(resume);
      setAnalysisResult(result);
    } catch (e) {
      showToast(e.message || "Analysis failed.", "error");
    }
    setLoadingAnalysis(false);
  }

  async function handleFetchJobs() {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingJobs(true);
    setJobs([]);
    showToast("Reading your resume...", "info");
    try {
      let resumeData = { primaryRole: "software developer", keywords: [], experienceLevel: "junior" };
      try {
        resumeData = await extractJobKeywords(resume);
        showToast(`Searching "${resumeData.primaryRole}" across 20+ portals...`, "info");
      } catch {
        const kws = extractKeywords(resume);
        resumeData = { primaryRole: kws[0] || "software developer", keywords: kws, experienceLevel: "junior" };
        showToast(`Searching ${resumeData.primaryRole} jobs...`, "info");
      }
      const fetched = await fetchJobsFromAPI(resumeData);
      setJobs(fetched);
      if (fetched.length > 0) {
        showToast(`✅ Found ${fetched.length} jobs across ${new Set(fetched.map(j => j.portal)).size} portals!`);
      } else {
        showToast("No jobs found. Try searching manually in Job Board.", "error");
      }
    } catch (e) {
      showToast("Could not fetch jobs. Check your internet connection.", "error");
    }
    setLoadingJobs(false);
  }

  async function handleCustomSearch(searchTerm) {
    setLoadingJobs(true);
    showToast(`Searching "${searchTerm}"...`, "info");
    try {
      const resumeData = { primaryRole: searchTerm, keywords: [searchTerm], experienceLevel: "junior" };
      const fetched = await fetchJobsFromAPI(resumeData);
      if (fetched.length > 0) {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const newOnes = fetched.filter(j => !existingIds.has(j.id));
          return [...prev, ...newOnes];
        });
        showToast(`✅ Added ${fetched.length} "${searchTerm}" jobs to the board!`);
      } else {
        showToast(`No jobs found for "${searchTerm}".`, "error");
      }
    } catch {
      showToast("Search failed. Try again.", "error");
    }
    setLoadingJobs(false);
  }

  async function handleMatchAll() {
    if (!resume) return showToast("Please upload your resume first.", "error");
    if (jobs.length === 0) return showToast("Find jobs first.", "error");
    setLoadingMatch(true);
    showToast(`Scoring ${jobs.length} jobs...`, "info");
    try {
      // Score in batches of 5 to avoid rate limits
      const batchSize = 5;
      let updated = [...jobs];
      for (let i = 0; i < updated.length; i += batchSize) {
        const batch = updated.slice(i, i + batchSize);
        const scored = await Promise.all(batch.map(async job => {
          try {
            const { score, reason, missingSkills, matchingSkills } = await matchResumeToJob(resume, job);
            return { ...job, match: score, matchReason: reason, missingSkills: missingSkills || [], matchingSkills: matchingSkills || [] };
          } catch { return job; }
        }));
        updated.splice(i, batchSize, ...scored);
        setJobs([...updated]); // live update
      }
      updated.sort((a, b) => (b.match || 0) - (a.match || 0));
      setJobs(updated);
      const top = updated.find(j => j.match != null);
      showToast(`✅ Scoring done! Top match: ${top?.match || 0}%`);
    } catch {
      showToast("Scoring failed.", "error");
    }
    setLoadingMatch(false);
  }

  async function handleEnhance(job) {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingEnhance(true);
    setEnhancedResume("");
    setCoverLetter("");
    showToast(`Enhancing resume for ${job.title}...`, "info");
    try {
      const [enhanced, cover] = await Promise.all([
        enhanceResumeForJob(resume, job),
        generateCoverLetter(resume, job),
      ]);
      if (!enhanced || enhanced.trim().length < 50) throw new Error("Enhancement returned empty. Try again.");
      setEnhancedResume(enhanced);
      setCoverLetter(cover);
      showToast("✅ Resume enhanced & cover letter ready!");
    } catch (e) {
      showToast(e.message || "Enhancement failed.", "error");
    }
    setLoadingEnhance(false);
  }

  async function handleApplyToJob(job, resumeToUse, coverLetterToUse) {
    setLoadingApply(true);
    // Open job URL
    if (job.url) window.open(job.url, "_blank");
    await new Promise(r => setTimeout(r, 800));

    const app = {
      id: `${job.id}-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      portal: job.portal,
      portalColor: job.portalColor,
      location: job.location,
      salary: job.salary,
      url: job.url,
      match: job.match,
      status: "Applied",
      appliedAt: new Date().toLocaleString(),
      resumeUsed: resumeToUse || resume,
      coverLetterUsed: coverLetterToUse || "",
    };

    setApplications(prev => [app, ...prev.filter(a => a.jobId !== job.id)]);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, applied: true, status: "Applied", appliedAt: app.appliedAt } : j));
    setApplyPanel(false);
    setSelectedJob(null);
    setLoadingApply(false);
    showToast(`✅ Applied to ${job.title} at ${job.company}!`);
    setTab("tracker");
  }

  async function handleAutoApplyAll() {
    const eligible = jobs.filter(j => !j.applied).slice(0, 8);
    if (eligible.length === 0) return showToast("No unapplied jobs found. Find jobs first.", "error");
    setAutoApplying(true);
    showToast(`Auto-applying to ${eligible.length} jobs...`, "info");
    for (const job of eligible) {
      await handleApplyToJob(job, enhancedResume || resume, coverLetter);
      await new Promise(r => setTimeout(r, 600));
    }
    setAutoApplying(false);
    showToast(`✅ Applied to ${eligible.length} jobs! Check Tracker tab.`);
  }

  function openApplyPanel(job) {
    setSelectedJob(job);
    setEnhancedResume("");
    setCoverLetter("");
    setApplyPanel(true);
  }

  function openEnhancer(job) {
    setSelectedJob(job);
    setEnhancedResume("");
    setCoverLetter("");
    setTab("enhance");
  }

  const unappliedCount = jobs.filter(j => !j.applied).length;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'DM Mono','Courier New',monospace", display: "flex", flexDirection: "column" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#38bdf8,#818cf8)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "16px", fontWeight: "800", color: "#f1f5f9" }}>ApplyBot</div>
            <div style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Job Application System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {applications.length > 0 && (
            <div style={{ fontSize: "11px", color: "#4ade80", background: "#064e3b", border: "1px solid #166534", padding: "4px 10px", borderRadius: "20px" }}>
              ✓ {applications.length} Applied
            </div>
          )}
          {jobs.length > 0 && (
            <div style={{ fontSize: "11px", color: "#7dd3fc", background: "#0d1f35", border: "1px solid #1e3f5a", padding: "4px 10px", borderRadius: "20px" }}>
              {jobs.length} Jobs · {new Set(jobs.map(j => j.portal)).size} Portals
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: resume ? "#22c55e" : "#475569" }} className={resume ? "pulse" : ""} />
            <span style={{ fontSize: "11px", color: resume ? "#4ade80" : "#475569" }}>{resume ? "Resume Active" : "No Resume"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e293b", display: "flex", padding: "0 16px", flexShrink: 0 }}>
        {[
          ["dashboard", "Dashboard"],
          ["jobs", "Job Board"],
          ["enhance", "AI Enhancer"],
          ["tracker", `Tracker${applications.length > 0 ? ` (${applications.length})` : ""}`],
        ].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>⬡ {label}</button>
        ))}
      </div>

      {/* Auto Apply Banner — shows whenever there are unapplied jobs */}
      {unappliedCount > 0 && (
        <div style={{ background: "#0a1628", borderBottom: "1px solid #1e3f5a", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexShrink: 0 }}>
          <span style={{ fontSize: "12px", color: "#7dd3fc" }}>
            ⚡ {unappliedCount} unapplied jobs ready
            {jobs.filter(j => j.match != null && j.match >= 60 && !j.applied).length > 0 &&
              ` · ${jobs.filter(j => j.match != null && j.match >= 60 && !j.applied).length} with 60%+ match`}
          </span>
          <button className="btn btn-success" style={{ padding: "5px 14px", fontSize: "12px" }} onClick={handleAutoApplyAll} disabled={autoApplying}>
            {autoApplying ? <><span className="spinner" /> Applying...</> : `⚡ Auto Apply All`}
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
        {tab === "dashboard" && (
          <Dashboard
            resume={resume} setResume={setResume}
            resumeFile={resumeFile} setResumeFile={setResumeFile}
            jobs={jobs} applications={applications}
            analysisResult={analysisResult}
            loadingAnalysis={loadingAnalysis}
            loadingMatch={loadingMatch}
            loadingJobs={loadingJobs}
            onAnalyze={handleAnalyze}
            onFetchJobs={handleFetchJobs}
            onMatchAll={handleMatchAll}
            onApply={openApplyPanel}
            onAutoApplyAll={handleAutoApplyAll}
            autoApplying={autoApplying}
            showToast={showToast}
          />
        )}
        {tab === "jobs" && (
          <JobBoard
            jobs={jobs} resume={resume}
            loadingJobs={loadingJobs} loadingMatch={loadingMatch}
            onFetchJobs={handleFetchJobs}
            onMatchAll={handleMatchAll}
            onApply={openApplyPanel}
            onEnhance={openEnhancer}
            onCustomSearch={handleCustomSearch}
          />
        )}
        {tab === "enhance" && (
          <AIEnhancer
            jobs={jobs} resume={resume}
            selectedJob={selectedJob} setSelectedJob={setSelectedJob}
            enhancedResume={enhancedResume} setEnhancedResume={setEnhancedResume}
            coverLetter={coverLetter} setCoverLetter={setCoverLetter}
            loadingEnhance={loadingEnhance}
            onEnhance={handleEnhance}
            onApply={openApplyPanel}
          />
        )}
        {tab === "tracker" && (
          <Tracker
            applications={applications}
            setApplications={setApplications}
            onBrowse={() => setTab("jobs")}
          />
        )}
      </div>

      {/* Apply Panel Modal */}
      {applyPanel && selectedJob && (
        <ApplyPanel
          job={selectedJob}
          resume={resume}
          enhancedResume={enhancedResume}
          setEnhancedResume={setEnhancedResume}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          loadingApply={loadingApply}
          onSubmit={() => handleApplyToJob(selectedJob, enhancedResume || resume, coverLetter)}
          onEnhance={() => { setApplyPanel(false); openEnhancer(selectedJob); }}
          onClose={() => { setApplyPanel(false); setSelectedJob(null); }}
        />
      )}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type || "success"}`}>{toast.msg}</div>}
    </div>
  );
}
