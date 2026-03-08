/**
 * Fetch real jobs from multiple portals.
 * Fresher-focused portals added: DevITjobs, HackerNews Jobs,
 * internship/entry-level filters across all portals,
 * plus junior/graduate/intern keyword boosting.
 */

const FRESHER_KEYWORDS = ["junior", "entry level", "graduate", "intern", "fresher", "trainee", "associate", "0-1 year", "no experience"];

function isFresherFriendly(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  return FRESHER_KEYWORDS.some((kw) => text.includes(kw));
}

function normalize(job) {
  return {
    match: null, matchReason: null, missingSkills: [],
    applied: false, status: null,
    ...job,
  };
}

// ── Remotive ──────────────────────────────────────────────────────────────
async function fetchRemotive(keyword) {
  const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=10`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `remotive-${j.id}`,
    portal: "Remotive", portalColor: "#6366f1",
    title: j.title, company: j.company_name,
    location: j.candidate_required_location || "Remote",
    salary: j.salary || "Not specified",
    type: j.job_type || "Full-time",
    posted: new Date(j.publication_date).toLocaleDateString(),
    tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url,
    fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

// ── Arbeitnow ─────────────────────────────────────────────────────────────
async function fetchArbeitnow(keyword) {
  const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(keyword)}`);
  const data = await res.json();
  return (data.data || []).slice(0, 10).map((j) => normalize({
    id: `arbeitnow-${j.slug}`,
    portal: "Arbeitnow", portalColor: "#0ea5e9",
    title: j.title, company: j.company_name,
    location: j.location || "Remote",
    salary: "Not specified",
    type: j.job_types?.join(", ") || "Full-time",
    posted: new Date(j.created_at * 1000).toLocaleDateString(),
    tags: (j.tags || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url,
    fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

// ── The Muse ──────────────────────────────────────────────────────────────
async function fetchTheMuse(keyword) {
  const res = await fetch(`https://www.themuse.com/api/public/jobs?descending=true&page=1&category=${encodeURIComponent(keyword)}&level=Entry+Level&api_key=public`);
  const data = await res.json();
  return (data.results || []).slice(0, 10).map((j) => normalize({
    id: `muse-${j.id}`,
    portal: "The Muse", portalColor: "#a855f7",
    title: j.name, company: j.company?.name || "Unknown",
    location: j.locations?.map((l) => l.name).join(", ") || "Remote",
    salary: "Not specified", type: j.type || "Full-time",
    posted: new Date(j.publication_date).toLocaleDateString(),
    tags: (j.categories || []).slice(0, 5).map((c) => c.name),
    description: (j.contents || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.refs?.landing_page || "",
    fresherFriendly: true, // filtered to Entry Level
  }));
}

// ── Himalayas ─────────────────────────────────────────────────────────────
async function fetchHimalayas(keyword) {
  const res = await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(keyword)}&limit=10`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `himalayas-${j.id}`,
    portal: "Himalayas", portalColor: "#14b8a6",
    title: j.title, company: j.companyName || "Unknown",
    location: j.locationRestrictions?.join(", ") || "Remote",
    salary: j.salaryRange ? `$${j.salaryRange.min}–$${j.salaryRange.max}` : "Not specified",
    type: j.jobType || "Full-time",
    posted: new Date(j.createdAt).toLocaleDateString(),
    tags: (j.skills || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.applicationLink || "",
    fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

// ── Working Nomads ────────────────────────────────────────────────────────
async function fetchWorkingNomads(keyword) {
  const res = await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${encodeURIComponent(keyword)}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).slice(0, 10).map((j) => normalize({
    id: `workingnomads-${j.id}`,
    portal: "Working Nomads", portalColor: "#f59e0b",
    title: j.title, company: j.company_name || "Unknown",
    location: j.location || "Remote", salary: "Not specified", type: "Remote",
    posted: new Date(j.pub_date).toLocaleDateString(),
    tags: (j.tags || "").split(",").slice(0, 5).map((t) => t.trim()).filter(Boolean),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "",
    fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

// ── Jobicy ────────────────────────────────────────────────────────────────
async function fetchJobicy(keyword) {
  const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=10&tag=${encodeURIComponent(keyword)}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `jobicy-${j.id}`,
    portal: "Jobicy", portalColor: "#ec4899",
    title: j.jobTitle, company: j.companyName || "Unknown",
    location: j.jobGeo || "Remote",
    salary: j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : "Not specified",
    type: j.jobType || "Full-time",
    posted: new Date(j.pubDate).toLocaleDateString(),
    tags: (j.jobIndustry || []).slice(0, 5),
    description: (j.jobDescription || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "",
    fresherFriendly: isFresherFriendly(j.jobTitle, j.jobDescription),
  }));
}

// ── Findwork ──────────────────────────────────────────────────────────────
async function fetchFindwork(keyword) {
  const res = await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(keyword)}&remote=true`);
  const data = await res.json();
  return (data.results || []).slice(0, 10).map((j) => normalize({
    id: `findwork-${j.id}`,
    portal: "Findwork", portalColor: "#22c55e",
    title: j.role, company: j.company_name || "Unknown",
    location: j.location || "Remote", salary: "Not specified", type: "Full-time",
    posted: new Date(j.date_posted).toLocaleDateString(),
    tags: (j.keywords || []).slice(0, 5),
    description: `${j.role} at ${j.company_name}. ${j.location || "Remote"}.`,
    url: j.url || "",
    fresherFriendly: isFresherFriendly(j.role, ""),
  }));
}

// ── Remote OK ─────────────────────────────────────────────────────────────
async function fetchRemoteOK(keyword) {
  const res = await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(keyword)}`, {
    headers: { "User-Agent": "ApplyBot/1.0" },
  });
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter((j) => j.id)
    .slice(0, 10)
    .map((j) => normalize({
      id: `remoteok-${j.id}`,
      portal: "Remote OK", portalColor: "#84cc16",
      title: j.position, company: j.company || "Unknown",
      location: "Remote",
      salary: j.salary_min ? `$${j.salary_min}–$${j.salary_max}` : "Not specified",
      type: "Remote",
      posted: new Date(j.date).toLocaleDateString(),
      tags: (j.tags || []).slice(0, 5),
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || "",
      fresherFriendly: isFresherFriendly(j.position, j.description),
    }));
}

// ── DevITjobs (Fresher-friendly tech jobs) ────────────────────────────────
async function fetchDevITjobs(keyword) {
  const res = await fetch(`https://devitjobs.com/api/jobsLight?skill=${encodeURIComponent(keyword)}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).slice(0, 10).map((j) => normalize({
    id: `devitjobs-${j.id}`,
    portal: "DevITjobs", portalColor: "#0284c7",
    title: j.title || j.position, company: j.company || "Unknown",
    location: j.location || "Remote",
    salary: j.salary || "Not specified",
    type: j.type || "Full-time",
    posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : "Recently",
    tags: (j.skills || j.tags || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || `https://devitjobs.com/jobs/${j.id}`,
    fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

// ── Hacker News Jobs (monthly Who's Hiring thread) ────────────────────────
async function fetchHackerNewsJobs() {
  try {
    const storiesRes = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
    const ids = await storiesRes.json();
    const top = ids.slice(0, 15);
    const jobs = await Promise.all(
      top.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then((r) => r.json())
          .catch(() => null)
      )
    );
    return jobs
      .filter((j) => j && j.title)
      .map((j) => normalize({
        id: `hn-${j.id}`,
        portal: "HackerNews", portalColor: "#f97316",
        title: j.title.replace(/^Ask HN: |^HN: /i, ""),
        company: extractCompanyFromHN(j.title),
        location: "Remote / Various",
        salary: "Not specified", type: "Full-time",
        posted: new Date(j.time * 1000).toLocaleDateString(),
        tags: extractTagsFromHN(j.title),
        description: (j.text || "").replace(/<[^>]+>/g, "").slice(0, 1500),
        url: j.url || `https://news.ycombinator.com/item?id=${j.id}`,
        fresherFriendly: isFresherFriendly(j.title, j.text || ""),
      }));
  } catch {
    return [];
  }
}

function extractCompanyFromHN(title = "") {
  const match = title.match(/^([^(|–-]+)/);
  return match ? match[1].trim() : "Unknown";
}

function extractTagsFromHN(title = "") {
  const techs = ["React", "Python", "Node", "Go", "Rust", "TypeScript", "AWS", "Remote", "Intern", "Junior"];
  return techs.filter((t) => title.toLowerCase().includes(t.toLowerCase()));
}

// ── Jobsearch.api (aggregator - freshers) ─────────────────────────────────
async function fetchCareerjet(keyword) {
  // Using public CORS-friendly endpoint
  const res = await fetch(
    `https://public.api.breezy.hr/v3/jobs?state=published&department=Engineering&type=full-time`
  );
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter((j) => j.name?.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 8)
    .map((j) => normalize({
      id: `breezy-${j._id}`,
      portal: "Breezy HR", portalColor: "#8b5cf6",
      title: j.name, company: j.company?.name || "Unknown",
      location: j.location?.name || "Remote",
      salary: "Not specified", type: j.type || "Full-time",
      posted: new Date(j.creation_date).toLocaleDateString(),
      tags: [],
      description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: j.url || "",
      fresherFriendly: isFresherFriendly(j.name, j.description),
    }));
}

// ── Internshala (India - Freshers/Interns) ────────────────────────────────
async function fetchInternshalaStyle(keyword) {
  // Using Remotive with "intern" keyword since Internshala has no public API
  const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("intern " + keyword)}&limit=10`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `intern-${j.id}`,
    portal: "Internships", portalColor: "#f43f5e",
    title: j.title, company: j.company_name,
    location: j.candidate_required_location || "Remote",
    salary: j.salary || "Stipend",
    type: "Internship",
    posted: new Date(j.publication_date).toLocaleDateString(),
    tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url,
    fresherFriendly: true,
  }));
}

// ── Entry Level specific search ───────────────────────────────────────────
async function fetchEntryLevel(keyword) {
  const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("junior " + keyword)}&limit=10`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `entry-${j.id}`,
    portal: "Entry Level", portalColor: "#10b981",
    title: j.title, company: j.company_name,
    location: j.candidate_required_location || "Remote",
    salary: j.salary || "Not specified",
    type: j.job_type || "Full-time",
    posted: new Date(j.publication_date).toLocaleDateString(),
    tags: (j.tags || []).slice(0, 5).map((t) => t.name || t),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url,
    fresherFriendly: true,
  }));
}

// ── Graduate Jobs (Arbeitnow entry level) ─────────────────────────────────
async function fetchGraduateJobs(keyword) {
  const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("graduate " + keyword)}`);
  const data = await res.json();
  return (data.data || []).slice(0, 8).map((j) => normalize({
    id: `grad-${j.slug}`,
    portal: "Graduate Jobs", portalColor: "#6d28d9",
    title: j.title, company: j.company_name,
    location: j.location || "Remote",
    salary: "Not specified",
    type: j.job_types?.join(", ") || "Full-time",
    posted: new Date(j.created_at * 1000).toLocaleDateString(),
    tags: (j.tags || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url,
    fresherFriendly: true,
  }));
}

// ── Jobicy Internships ────────────────────────────────────────────────────
async function fetchJobicyIntern(keyword) {
  const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=10&tag=${encodeURIComponent(keyword)}&level=junior`);
  const data = await res.json();
  return (data.jobs || []).map((j) => normalize({
    id: `jobicy-intern-${j.id}`,
    portal: "Jobicy Junior", portalColor: "#db2777",
    title: j.jobTitle, company: j.companyName || "Unknown",
    location: j.jobGeo || "Remote",
    salary: j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : "Competitive",
    type: j.jobType || "Full-time",
    posted: new Date(j.pubDate).toLocaleDateString(),
    tags: (j.jobIndustry || []).slice(0, 5),
    description: (j.jobDescription || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "",
    fresherFriendly: true,
  }));
}

// ── Main fetcher ──────────────────────────────────────────────────────────
export async function fetchJobsFromAPI(keywords = []) {
  const kw1 = keywords[0] || "software engineer";
  const kw2 = keywords[1] || kw1;
  const kw3 = keywords[2] || kw1;

  const fetchers = [
    // General portals
    fetchRemotive(kw1),
    fetchRemotive(kw2),
    fetchArbeitnow(kw1),
    fetchTheMuse(kw1),
    fetchHimalayas(kw1),
    fetchWorkingNomads(kw1),
    fetchJobicy(kw1),
    fetchJobicy(kw2),
    fetchFindwork(kw1),
    fetchRemoteOK(kw3),
    fetchDevITjobs(kw1),
    fetchHackerNewsJobs(),
    fetchCareerjet(kw1),
    // Fresher-specific portals
    fetchInternshalaStyle(kw1),
    fetchInternshalaStyle(kw2),
    fetchEntryLevel(kw1),
    fetchEntryLevel(kw2),
    fetchGraduateJobs(kw1),
    fetchJobicyIntern(kw1),
  ];

  const results = await Promise.allSettled(fetchers);
  const allJobs = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Deduplicate by title+company
  const seen = new Set();
  const unique = allJobs.filter((j) => {
    const key = `${j.title}-${j.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: fresher-friendly jobs first, then by recency
  unique.sort((a, b) => {
    if (a.fresherFriendly && !b.fresherFriendly) return -1;
    if (!a.fresherFriendly && b.fresherFriendly) return 1;
    return 0;
  });

  return unique.slice(0, 80);
}

// ── Simple keyword extractor (fallback) ──────────────────────────────────
export function extractKeywords(resume) {
  const techKeywords = [
    "react", "node", "python", "java", "typescript", "javascript",
    "aws", "docker", "kubernetes", "machine learning", "data science",
    "devops", "backend", "frontend", "fullstack", "flutter", "ios",
    "android", "django", "fastapi", "golang", "rust", "c++", "sql",
    "product manager", "designer", "ux", "ui", "marketing", "sales",
    "data engineer", "cloud", "security", "blockchain", "embedded",
    "php", "ruby", "swift", "kotlin", "unity", "game", "wordpress",
  ];
  const lower = resume.toLowerCase();
  return techKeywords.filter((kw) => lower.includes(kw)).slice(0, 3);
}
