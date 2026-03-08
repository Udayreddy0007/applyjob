import { useState } from "react";
import { GLOBAL_STYLES } from "../styles/theme";
import MOCK_JOBS from "../data/jobs";
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
  const [jobs, setJobs] = useState(MOCK_JOBS);
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

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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
    showToast("Finding relevant jobs for your resume...", "success");
    try {
      // Extract keywords from resume using AI first, fallback to simple parsing
      let keywords = extractKeywords(resume);
      try {
        const aiKeywords = await extractJobKeywords(resume);
        if (aiKeywords.length > 0) keywords = aiKeywords;
      } catch {
        // use simple keywords as fallback
      }

      const fetchedJobs = await fetchJobsFromAPI(keywords);
      if (fetchedJobs.length > 0) {
        setJobs(fetchedJobs);
        showToast(`Found ${fetchedJobs.length} relevant jobs for your profile!`);
      } else {
        showToast("No jobs found. Showing default listings.", "error");
        setJobs(MOCK_JOBS);
      }
    } catch (e) {
      showToast("Could not fetch jobs. Showing defaults.", "error");
      setJobs(MOCK_JOBS);
    }
    setLoadingJobs(false);
  }

  async function handleMatchAll() {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingMatch(true);
    showToast("Scoring all jobs against your resume...");
    try {
      const updated = await Promise.all(
        jobs.map(async (job) => {
          try {
            const { score, reason, missingSkills } = await matchResumeToJob(resume, job);
            return { ...job, match: score, matchReason: reason, missingSkills };
          } catch {
            return { ...job, match: null };
          }
        })
      );
      // Sort by match score descending
      updated.sort((a, b) => (b.match || 0) - (a.match || 0));
      setJobs(updated);
      showToast("Job matching complete! Sorted by best match.");
    } catch (e) {
      showToast("Matching failed.", "error");
    }
    setLoadingMatch(false);
  }

  async function handleEnhance(job) {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingEnhance(true);
    setEnhancedResume("");
    setCoverLetter("");
    try {
      const [enhanced, cover] = await Promise.all([
        enhanceResumeForJob(resume, job),
        generateCoverLetter(resume, job),
      ]);
      setEnhancedResume(enhanced);
      setCoverLetter(cover);
      showToast("Resume enhanced & cover letter generated!");
    } catch (e) {
      showToast(e.message || "Enhancement failed.", "error");
    }
    setLoadingEnhance(false);
  }

  async function handleApplySubmit() {
    if (!selectedJob) return;
    setLoadingApply(true);
    await new Promise((r) => setTimeout(r, 2000));
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id
          ? { ...j, applied: true, status: "Applied", appliedAt: new Date().toLocaleString() }
          : j
      )
    );
    setApplyPanel(false);
    showToast(`✅ Applied to ${selectedJob.title} at ${selectedJob.company}!`);
    setLoadingApply(false);
  }

  function openApplyPanel(job) {
    setSelectedJob(job);
    setApplyPanel(true);
  }

  function openEnhancer(job) {
    setSelectedJob(job);
    setEnhancedResume("");
    setCoverLetter("");
    setTab("enhance");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'DM Mono', 'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* HEADER */}
      <div style={{ padding: "20px 30px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#080c14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #38bdf8, #818cf8)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em" }}>ApplyBot</div>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Job Application System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: resume ? "#22c55e" : "#475569" }} className={resume ? "pulse" : ""} />
          <span style={{ fontSize: "11px", color: resume ? "#4ade80" : "#475569" }}>{resume ? "Resume Active" : "No Resume"}</span>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: "1px solid #1e293b", display: "flex", padding: "0 20px", background: "#080c14" }}>
        {[["dashboard", "⬡ Dashboard"], ["jobs", "⬡ Job Board"], ["enhance", "⬡ AI Enhancer"], ["tracker", "⬡ Applications"]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* PAGE CONTENT */}
      <div style={{ flex: 1, padding: "24px 30px", overflow: "auto" }}>
        {tab === "dashboard" && (
          <Dashboard
            resume={resume} setResume={setResume}
            resumeFile={resumeFile} setResumeFile={setResumeFile}
            jobs={jobs}
            analysisResult={analysisResult}
            loadingAnalysis={loadingAnalysis}
            loadingMatch={loadingMatch}
            loadingJobs={loadingJobs}
            onAnalyze={handleAnalyze}
            onFetchJobs={handleFetchJobs}
            onMatchAll={handleMatchAll}
            onApply={openApplyPanel}
            showToast={showToast}
          />
        )}
        {tab === "jobs" && (
          <JobBoard
            jobs={jobs}
            resume={resume}
            loadingJobs={loadingJobs}
            loadingMatch={loadingMatch}
            onFetchJobs={handleFetchJobs}
            onMatchAll={handleMatchAll}
            onApply={openApplyPanel}
            onEnhance={openEnhancer}
          />
        )}
        {tab === "enhance" && (
          <AIEnhancer
            jobs={jobs}
            resume={resume}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            enhancedResume={enhancedResume}
            setEnhancedResume={setEnhancedResume}
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            loadingEnhance={loadingEnhance}
            onEnhance={handleEnhance}
            onApply={openApplyPanel}
          />
        )}
        {tab === "tracker" && (
          <Tracker jobs={jobs} onBrowse={() => setTab("jobs")} />
        )}
      </div>

      {/* APPLY PANEL */}
      {applyPanel && selectedJob && (
        <ApplyPanel
          job={selectedJob}
          resume={resume}
          enhancedResume={enhancedResume}
          setEnhancedResume={setEnhancedResume}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          loadingApply={loadingApply}
          onSubmit={handleApplySubmit}
          onClose={() => setApplyPanel(false)}
        />
      )}

      {/* TOAST */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
