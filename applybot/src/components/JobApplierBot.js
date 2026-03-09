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
    setTimeout(() => setToast(null), 4000);
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
    showToast("Extracting your profile from resume...");
    try {
      let resumeData = { primaryRole: "software engineer", keywords: [], experienceLevel: "junior" };
      try {
        resumeData = await extractJobKeywords(resume);
        showToast(`Finding "${resumeData.primaryRole}" jobs across 15 portals...`);
      } catch {
        const kws = extractKeywords(resume);
        resumeData = { primaryRole: kws[0] || "software engineer", keywords: kws, experienceLevel: "junior" };
      }
      const fetched = await fetchJobsFromAPI(resumeData);
      if (fetched.length > 0) {
        const merged = fetched.map((j) => {
          const ex = jobs.find((ej) => ej.id === j.id);
          return ex ? { ...j, applied: ex.applied, appliedAt: ex.appliedAt, status: ex.status } : j;
        });
        setJobs(merged);
        showToast(`✅ Found ${fetched.length} jobs matching your profile!`);
      } else {
        showToast("No jobs found. Try again.", "error");
      }
    } catch (e) {
      showToast("Could not fetch jobs. Try again.", "error");
    }
    setLoadingJobs(false);
  }

  // Custom search — user types any role
  async function handleCustomSearch(searchTerm) {
    setLoadingJobs(true);
    showToast(`Searching for "${searchTerm}" jobs...`);
    try {
      const resumeData = {
        primaryRole: searchTerm,
        keywords: [searchTerm],
        experienceLevel: "junior",
      };
      const fetched = await fetchJobsFromAPI(resumeData);
      if (fetched.length > 0) {
        // Merge with existing jobs, avoid duplicates
        setJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const newJobs = fetched.filter((j) => !existingIds.has(j.id));
          return [...prev, ...newJobs];
        });
        showToast(`✅ Found ${fetched.length} "${searchTerm}" jobs! Added to board.`);
      } else {
        showToast(`No jobs found for "${searchTerm}". Try a different term.`, "error");
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
    showToast(`Scoring ${jobs.length} jobs against your resume...`);
    try {
      const updated = await Promise.all(
        jobs.map(async (job) => {
          try {
            const { score, reason, missingSkills, matchingSkills } = await matchResumeToJob(resume, job);
            return { ...job, match: score, matchReason: reason, missingSkills: missingSkills || [], matchingSkills: matchingSkills || [] };
          } catch { return { ...job, match: null }; }
        })
      );
      updated.sort((a, b) => (b.match || 0) - (a.match || 0));
      setJobs(updated);
      showToast(`✅ Scored ${updated.length} jobs! Top match: ${updated[0]?.match || 0}%`);
    } catch {
      showToast("Matching failed.", "error");
    }
    setLoadingMatch(false);
  }

  async function handleEnhance(job) {
    if (!resume) return showToast("Please upload your resume first.", "error");
    setLoadingEnhance(true);
    setEnhancedResume("");
    setCoverLetter("");
    showToast(`Enhancing resume for ${job.title}...`);
    try {
      const [enhanced, cover] = await Promise.all([
        enhanceResumeForJob(resume, job),
        generateCoverLetter(resume, job),
      ]);
      if (!enhanced || enhanced.trim().length < 100) throw new Error("Enhancement returned empty. Try again.");
      setEnhancedResume(enhanced);
      setCoverLetter(cover);
      showToast("✅ Resume enhanced & cover letter generated!");
    } catch (e) {
      showToast(e.message || "Enhancement failed. Try again.", "error");
    }
    setLoadingEnhance(false);
  }

  async function handleAutoApply(job, resumeToUse, coverLetterTowhitespace) {
    setLoadingApply(true);
    if (job.url) window.open(job.url, "_blank");
    await new Promise((r) => setTimeout(r, 1200));

    const app = {
      id: job.id, jobTitle: job.title, company: job.company,
      portal: job.portal, portalColor: job.portalColor,
      location: job.location, salary: job.salary, url: job.url,
      match: job.match, status: "Applied",
      appliedAt: new Date().toLocaleString(),
      resumeUsed: resumeToUse || resume,
      coverLetterUsed: coverLetterTowhitespace || "",
    };

    setApplications((prev) => {
      const exists = prev.find((a) => a.id === job.id);
      return exists ? prev.map((a) => a.id === job.id ? app : a) : [app, ...prev];
    });
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, applied: true, status: "Applied", appliedAt: app.appliedAt } : j));
    setApplyPanel(false);
    setLoadingApply(false);
    showToast(`✅ Applied to ${job.title} at ${job.company}!`);
    setTab("tracker");
  }

  async function handleAutoApplyAll() {
    const topJobs = jobs.filter((j) => j.match >= 60 && !j.applied).slice(0, 5);
    if (topJobs.length === 0) return showToast("No jobs with 60%+ match. Score jobs first.", "error");
    setAutoApplying(true);
    for (const job of topJobs) {
      await handleAutoApply(job, enhancedResume || resume, coverLetter);
      await new Promise((r) => setTimeout(r, 800));
    }
    setAutoApplying(false);
    showToast(`✅ Applied to ${topJobs.length} jobs! Check Tracker.`);
    setTab("tracker");
  }

  function openApplyPanel(job) { setSelectedJob(job); setApplyPanel(true); }
  function openEnhancer(job) { setSelectedJob(job); setEnhancedResume(""); setCoverLetter(""); setTab("enhance"); }

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'DM Mono','Courier New',monospace", display: "flex", flexDirection: "column" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Header */}
      <div style={{ padding: "16px 30px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg,#38bdf8,#818cf8)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: "800", color: "#f1f5f9" }}>ApplyBot</div>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Job Application System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {applications.length > 0 && <div style={{ fontSize: "11px", color: "#4ade80", background: "#064e3b", border: "1px solid #166534", padding: "4px 12px", borderRadius: "20px" }}>{applications.length} Applied</div>}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: resume ? "#22c55e" : "#475569" }} />
            <span style={{ fontSize: "11px", color: resume ? "#4ade80" : "#475569" }}>{resume ? "Resume Active" : "No Resume"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e293b", display: "flex", padding: "0 20px" }}>
        {[["dashboard","⬡ Dashboard"],["jobs","⬡ Job Board"],["enhance","⬡ AI Enhancer"],["tracker",`⬡ Tracker${applications.length > 0 ? ` (${applications.length})` : ""}`]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* Auto Apply Banner */}
      {jobs.filter((j) => j.match >= 60 && !j.applied).length > 0 && (
        <div style={{ background: "#0d1f35", borderBottom: "1px solid #1e3f5a", padding: "10px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#7dd3fc" }}>⬡ {jobs.filter((j) => j.match >= 60 && !j.applied).length} jobs with 60%+ match ready</span>
          <button className="btn btn-success" style={{ padding: "6px 16px", fontSize: "12px" }} onClick={handleAutoApplyAll} disabled={autoApplying}>
            {autoApplying ? <><span className="spinner" /> Applying...</> : "⚡ Auto Apply All"}
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "24px 30px", overflow: "auto" }}>
        {tab === "dashboard" && <Dashboard resume={resume} setResume={setResume} resumeFile={resumeFile} setResumeFile={setResumeFile} jobs={jobs} applications={applications} analysisResult={analysisResult} loadingAnalysis={loadingAnalysis} loadingMatch={loadingMatch} loadingJobs={loadingJobs} onAnalyze={handleAnalyze} onFetchJobs={handleFetchJobs} onMatchAll={handleMatchAll} onApply={openApplyPanel} onAutoApplyAll={handleAutoApplyAll} autoApplying={autoApplying} showToast={showToast} />}
        {tab === "jobs" && <JobBoard jobs={jobs} resume={resume} loadingJobs={loadingJobs} loadingMatch={loadingMatch} onFetchJobs={handleFetchJobs} onMatchAll={handleMatchAll} onApply={openApplyPanel} onEnhance={openEnhancer} onCustomSearch={handleCustomSearch} />}
        {tab === "enhance" && <AIEnhancer jobs={jobs} resume={resume} selectedJob={selectedJob} setSelectedJob={setSelectedJob} enhancedResume={enhancedResume} setEnhancedResume={setEnhancedResume} coverLetter={coverLetter} setCoverLetter={setCoverLetter} loadingEnhance={loadingEnhance} onEnhance={handleEnhance} onApply={openApplyPanel} />}
        {tab === "tracker" && <Tracker applications={applications} setApplications={setApplications} onBrowse={() => setTab("jobs")} />}
      </div>

      {applyPanel && selectedJob && (
        <ApplyPanel job={selectedJob} resume={resume} enhancedResume={enhancedResume} setEnhancedResume={setEnhancedResume} coverLetter={coverLetter} setCoverLetter={setCoverLetter} loadingApply={loadingApply} onSubmit={() => handleAutoApply(selectedJob, enhancedResume || resume, coverLetter)} onEnhance={() => { setApplyPanel(false); openEnhancer(selectedJob); }} onClose={() => setApplyPanel(false)} />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
