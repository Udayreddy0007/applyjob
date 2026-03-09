/**
 * Fetch real jobs from multiple portals based on EXACT resume role.
 * Fresher-friendly portals included.
 */

const FRESHER_KEYWORDS = ["junior", "entry level", "graduate", "intern", "fresher", "trainee", "associate", "0-1 year", "no experience required"];

function isFresherFriendly(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  return FRESHER_KEYWORDS.some((kw) => text.includes(kw));
}

function normalize(job) {
  return { match: null, matchReason: null, missingSkills: [], matchingSkills: [], applied: false, status: null, appliedAt: null, ...job };
}

async function fetchRemotive(keyword) {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=12`);
    const data = await res.json();
    return (data.jobs || []).map((j) => normalize({
      id: `remotive-${j.id}`, portal: "Remotive", portalColor: "#6366f1",
      title: j.title, company: j.company_name,
      location: j.candidate_required_location || "Remote",
      salary: j.salary || "Not specified", type: j.job_type || "Full-time",
      posted: new Date(j.publication_date).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url, fresherFriendly: isFresherFriendly(j.title, j.description),
    }));
  } catch { return []; }
}

async function fetchArbeitnow(keyword) {
  try {
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return (data.data || []).slice(0, 12).map((j) => normalize({
      id: `arbeitnow-${j.slug}`, portal: "Arbeitnow", portalColor: "#0ea5e9",
      title: j.title, company: j.company_name, location: j.location || "Remote",
      salary: "Not specified", type: j.job_types?.join(", ") || "Full-time",
      posted: new Date(j.created_at * 1000).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url, fresherFriendly: isFresherFriendly(j.title, j.description),
    }));
  } catch { return []; }
}

async function fetchTheMuse(keyword) {
  try {
    const res = await fetch(`https://www.themuse.com/api/public/jobs?descending=true&page=1&category=${encodeURIComponent(keyword)}&level=Entry+Level&api_key=public`);
    const data = await res.json();
    return (data.results || []).slice(0, 10).map((j) => normalize({
      id: `muse-${j.id}`, portal: "The Muse", portalColor: "#a855f7",
      title: j.name, company: j.company?.name || "Unknown",
      location: j.locations?.map((l) => l.name).join(", ") || "Remote",
      salary: "Not specified", type: j.type || "Full-time",
      posted: new Date(j.publication_date).toLocaleDateString(),
      tags: (j.categories || []).slice(0, 5).map((c) => c.name),
      description: (j.contents || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.refs?.landing_page || "", fresherFriendly: true,
    }));
  } catch { return []; }
}

async function fetchHimalayas(keyword) {
  try {
    const res = await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(keyword)}&limit=10`);
    const data = await res.json();
    return (data.jobs || []).map((j) => normalize({
      id: `himalayas-${j.id}`, portal: "Himalayas", portalColor: "#14b8a6",
      title: j.title, company: j.companyName || "Unknown",
      location: j.locationRestrictions?.join(", ") || "Remote",
      salary: j.salaryRange ? `$${j.salaryRange.min}–$${j.salaryRange.max}` : "Not specified",
      type: j.jobType || "Full-time",
      posted: new Date(j.createdAt).toLocaleDateString(),
      tags: (j.skills || []).slice(0, 5),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.applicationLink || "", fresherFriendly: isFresherFriendly(j.title, j.description),
    }));
  } catch { return []; }
}

async function fetchJobicy(keyword) {
  try {
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=10&tag=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return (data.jobs || []).map((j) => normalize({
      id: `jobicy-${j.id}`, portal: "Jobicy", portalColor: "#ec4899",
      title: j.jobTitle, company: j.companyName || "Unknown",
      location: j.jobGeo || "Remote",
      salary: j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : "Not specified",
      type: j.jobType || "Full-time",
      posted: new Date(j.pubDate).toLocaleDateString(),
      tags: (j.jobIndustry || []).slice(0, 5),
      description: (j.jobDescription || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || "", fresherFriendly: isFresherFriendly(j.jobTitle, j.jobDescription),
    }));
  } catch { return []; }
}

async function fetchRemoteOK(keyword) {
  try {
    const res = await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(keyword)}`, { headers: { "User-Agent": "ApplyBot/1.0" } });
    const data = await res.json();
    return (Array.isArray(data) ? data : []).filter((j) => j.id).slice(0, 10).map((j) => normalize({
      id: `remoteok-${j.id}`, portal: "Remote OK", portalColor: "#84cc16",
      title: j.position, company: j.company || "Unknown", location: "Remote",
      salary: j.salary_min ? `$${j.salary_min}–$${j.salary_max}` : "Not specified",
      type: "Remote", posted: new Date(j.date).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || "", fresherFriendly: isFresherFriendly(j.position, j.description),
    }));
  } catch { return []; }
}

async function fetchInternships(keyword) {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("intern " + keyword)}&limit=10`);
    const data = await res.json();
    return (data.jobs || []).map((j) => normalize({
      id: `intern-${j.id}`, portal: "Internships", portalColor: "#f43f5e",
      title: j.title, company: j.company_name,
      location: j.candidate_required_location || "Remote",
      salary: j.salary || "Stipend", type: "Internship",
      posted: new Date(j.publication_date).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url, fresherFriendly: true,
    }));
  } catch { return []; }
}

async function fetchEntryLevel(keyword) {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("junior " + keyword)}&limit=10`);
    const data = await res.json();
    return (data.jobs || []).map((j) => normalize({
      id: `entry-${j.id}`, portal: "Entry Level", portalColor: "#10b981",
      title: j.title, company: j.company_name,
      location: j.candidate_required_location || "Remote",
      salary: j.salary || "Not specified", type: j.job_type || "Full-time",
      posted: new Date(j.publication_date).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url, fresherFriendly: true,
    }));
  } catch { return []; }
}

async function fetchGraduateJobs(keyword) {
  try {
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("graduate " + keyword)}`);
    const data = await res.json();
    return (data.data || []).slice(0, 10).map((j) => normalize({
      id: `grad-${j.slug}`, portal: "Graduate Jobs", portalColor: "#6d28d9",
      title: j.title, company: j.company_name, location: j.location || "Remote",
      salary: "Not specified", type: j.job_types?.join(", ") || "Full-time",
      posted: new Date(j.created_at * 1000).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url, fresherFriendly: true,
    }));
  } catch { return []; }
}

async function fetchHackerNews() {
  try {
    const storiesRes = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
    const ids = await storiesRes.json();
    const jobs = await Promise.all(
      ids.slice(0, 12).map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json()).catch(() => null)
      )
    );
    return jobs.filter((j) => j && j.title).map((j) => normalize({
      id: `hn-${j.id}`, portal: "HackerNews", portalColor: "#f97316",
      title: j.title.replace(/^Ask HN: |^HN: /i, ""),
      company: (j.title.match(/^([^(|–-]+)/) || ["", "Unknown"])[1].trim(),
      location: "Remote / Various", salary: "Not specified", type: "Full-time",
      posted: new Date(j.time * 1000).toLocaleDateString(),
      tags: ["React","Python","Node","Go","TypeScript","AWS","Intern","Junior"].filter((t) => j.title?.toLowerCase().includes(t.toLowerCase())),
      description: (j.text || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || `https://news.ycombinator.com/item?id=${j.id}`,
      fresherFriendly: isFresherFriendly(j.title, j.text || ""),
    }));
  } catch { return []; }
}

async function fetchWorkingNomads(keyword) {
  try {
    const res = await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 10).map((j) => normalize({
      id: `nomads-${j.id}`, portal: "Working Nomads", portalColor: "#f59e0b",
      title: j.title, company: j.company_name || "Unknown", location: "Remote",
      salary: "Not specified", type: "Remote",
      posted: new Date(j.pub_date).toLocaleDateString(),
      tags: (j.tags || "").split(",").slice(0, 5).map((t) => t.trim()).filter(Boolean),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || "", fresherFriendly: isFresherFriendly(j.title, j.description),
    }));
  } catch { return []; }
}

/**
 * Main fetcher — uses EXACT role from resume for precise matching
 */
export async function fetchJobsFromAPI(resumeData = {}) {
  const primaryRole = resumeData.primaryRole || "software engineer";
  const keywords = resumeData.keywords || [primaryRole];
  const experienceLevel = resumeData.experienceLevel || "junior";

  const kw1 = primaryRole;
  const kw2 = keywords[0] || primaryRole;
  const kw3 = keywords[1] || primaryRole;

  // Build search terms based on experience level
  const levelPrefix = experienceLevel === "fresher" || experienceLevel === "junior" ? "junior " : "";

  const fetchers = [
    fetchRemotive(kw1),
    fetchRemotive(kw2),
    fetchRemotive(levelPrefix + kw1),
    fetchArbeitnow(kw1),
    fetchArbeitnow(kw2),
    fetchTheMuse(kw1),
    fetchHimalayas(kw1),
    fetchHimalayas(kw2),
    fetchJobicy(kw1),
    fetchJobicy(kw2),
    fetchRemoteOK(kw3),
    fetchWorkingNomads(kw1),
    fetchHackerNews(),
    fetchInternships(kw1),
    fetchInternships(kw2),
    fetchEntryLevel(kw1),
    fetchEntryLevel(kw2),
    fetchGraduateJobs(kw1),
  ];

  const results = await Promise.allSettled(fetchers);
  const allJobs = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);

  // Deduplicate by title+company
  const seen = new Set();
  const unique = allJobs.filter((j) => {
    if (!j.title || !j.company) return false;
    const key = `${j.title}-${j.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort fresher-friendly first
  unique.sort((a, b) => {
    if (a.fresherFriendly && !b.fresherFriendly) return -1;
    if (!a.fresherFriendly && b.fresherFriendly) return 1;
    return 0;
  });

  return unique.slice(0, 80);
}

export function extractKeywords(resume) {
  const techKeywords = [
    "react", "node", "python", "java", "typescript", "javascript", "aws",
    "docker", "kubernetes", "machine learning", "data science", "devops",
    "backend", "frontend", "fullstack", "flutter", "ios", "android",
    "django", "fastapi", "golang", "rust", "sql", "product manager",
    "designer", "ux", "ui", "marketing", "data engineer", "cloud",
    "php", "ruby", "swift", "kotlin", "unity", "wordpress", "c++",
  ];
  const lower = resume.toLowerCase();
  return techKeywords.filter((kw) => lower.includes(kw)).slice(0, 3);
}
