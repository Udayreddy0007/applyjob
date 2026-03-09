/**
 * 20+ distinct portals using different APIs + search terms.
 * Each portal has a unique name so all show up in the filter.
 */

const FRESHER_KW = ["junior","entry level","entry-level","graduate","intern","fresher","trainee","associate","no experience","0-1 year","new grad","recent graduate","apprentice","campus hire"];

function isFresherFriendly(title="", desc="") {
  const t = `${title} ${desc}`.toLowerCase();
  return FRESHER_KW.some(k => t.includes(k));
}

function normalize(job) {
  return { match: null, matchReason: null, missingSkills: [], matchingSkills: [], applied: false, status: null, appliedAt: null, ...job };
}

function safeDate(val) {
  try { return new Date(val).toLocaleDateString(); } catch { return "Recently"; }
}

// Each fetcher uses a DIFFERENT base URL or meaningfully different query
// so results are genuinely distinct across portals.

async function callRemotive(keyword, label, color) {
  const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=15`);
  const d = await r.json();
  return (d.jobs || []).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.title, company: j.company_name,
    location: j.candidate_required_location || "Remote",
    salary: j.salary || "Not specified", type: j.job_type || "Full-time",
    posted: safeDate(j.publication_date),
    tags: (j.tags || []).slice(0, 5).map(t => t.name || t),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url, fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

async function callArbeitnow(keyword, label, color) {
  const r = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(keyword)}`);
  const d = await r.json();
  return (d.data || []).slice(0, 15).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.slug}`,
    portal: label, portalColor: color,
    title: j.title, company: j.company_name, location: j.location || "Remote",
    salary: "Not specified", type: j.job_types?.join(", ") || "Full-time",
    posted: safeDate(j.created_at * 1000),
    tags: (j.tags || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url, fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

async function callHimalayas(keyword, label, color) {
  const r = await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(keyword)}&limit=12`);
  const d = await r.json();
  return (d.jobs || []).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.title, company: j.companyName || "Unknown",
    location: j.locationRestrictions?.join(", ") || "Remote",
    salary: j.salaryRange ? `$${j.salaryRange.min}–$${j.salaryRange.max}` : "Not specified",
    type: j.jobType || "Full-time", posted: safeDate(j.createdAt),
    tags: (j.skills || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.applicationLink || "", fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

async function callJobicy(keyword, label, color, level = "") {
  const lvl = level ? `&level=${level}` : "";
  const r = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=12&tag=${encodeURIComponent(keyword)}${lvl}`);
  const d = await r.json();
  return (d.jobs || []).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.jobTitle, company: j.companyName || "Unknown", location: j.jobGeo || "Remote",
    salary: j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : "Not specified",
    type: j.jobType || "Full-time", posted: safeDate(j.pubDate),
    tags: (j.jobIndustry || []).slice(0, 5),
    description: (j.jobDescription || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "", fresherFriendly: level === "junior" || level === "entry" || isFresherFriendly(j.jobTitle, j.jobDescription),
  }));
}

async function callTheMuse(keyword, level, label, color) {
  const r = await fetch(`https://www.themuse.com/api/public/jobs?descending=true&page=1&category=${encodeURIComponent(keyword)}&level=${encodeURIComponent(level)}&api_key=public`);
  const d = await r.json();
  return (d.results || []).slice(0, 12).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.name, company: j.company?.name || "Unknown",
    location: j.locations?.map(l => l.name).join(", ") || "Remote",
    salary: "Not specified", type: j.type || "Full-time",
    posted: safeDate(j.publication_date),
    tags: (j.categories || []).slice(0, 5).map(c => c.name),
    description: (j.contents || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.refs?.landing_page || "", fresherFriendly: level.toLowerCase().includes("entry") || level.toLowerCase().includes("intern"),
  }));
}

async function callRemoteOK(keyword, label, color) {
  const r = await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(keyword)}`, { headers: { "User-Agent": "ApplyBot/1.0" } });
  const d = await r.json();
  return (Array.isArray(d) ? d : []).filter(j => j.id).slice(0, 12).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.position, company: j.company || "Unknown", location: "Remote",
    salary: j.salary_min ? `$${j.salary_min}–$${j.salary_max}` : "Not specified",
    type: "Remote", posted: safeDate(j.date),
    tags: (j.tags || []).slice(0, 5),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "", fresherFriendly: isFresherFriendly(j.position, j.description),
  }));
}

async function callWorkingNomads(keyword, label, color) {
  const r = await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${encodeURIComponent(keyword)}`);
  const d = await r.json();
  return (Array.isArray(d) ? d : []).slice(0, 10).map(j => normalize({
    id: `${label.replace(/\s/g,"-").toLowerCase()}-${j.id}`,
    portal: label, portalColor: color,
    title: j.title, company: j.company_name || "Unknown", location: "Remote",
    salary: "Not specified", type: "Remote", posted: safeDate(j.pub_date),
    tags: (j.tags || "").split(",").slice(0, 5).map(t => t.trim()).filter(Boolean),
    description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || "", fresherFriendly: isFresherFriendly(j.title, j.description),
  }));
}

async function callHackerNews() {
  const r = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
  const ids = await r.json();
  const jobs = await Promise.all(ids.slice(0, 15).map(id =>
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()).catch(() => null)
  ));
  return jobs.filter(j => j && j.title).map(j => normalize({
    id: `hn-${j.id}`, portal: "HackerNews Hiring", portalColor: "#f97316",
    title: j.title.replace(/^Ask HN: |^HN: /i, ""),
    company: (j.title.match(/^([^(|–-]+)/) || ["", "Unknown"])[1].trim(),
    location: "Remote / Various", salary: "Not specified", type: "Full-time",
    posted: safeDate(j.time * 1000),
    tags: ["React","Python","Node","Go","TypeScript","AWS","Intern","Junior"].filter(t => j.title?.toLowerCase().includes(t.toLowerCase())),
    description: (j.text || "").replace(/<[^>]+>/g, "").slice(0, 1500),
    url: j.url || `https://news.ycombinator.com/item?id=${j.id}`,
    fresherFriendly: isFresherFriendly(j.title, j.text || ""),
  }));
}

// ── MAIN FETCHER ───────────────────────────────────────────────────────────
export async function fetchJobsFromAPI(resumeData = {}) {
  const role = resumeData.primaryRole || "software developer";
  const kws = resumeData.keywords || [];
  const kw2 = kws[0] || role;
  const kw3 = kws[1] || role;

  const fetchers = [
    // ── Remotive variants (different search terms = different results) ──
    callRemotive(role,                    "Remotive",           "#6366f1").catch(() => []),
    callRemotive(`junior ${role}`,        "Remotive Junior",    "#818cf8").catch(() => []),
    callRemotive(`intern ${role}`,        "Remotive Intern",    "#a78bfa").catch(() => []),
    callRemotive(`entry level ${role}`,   "Remotive Entry",     "#7c3aed").catch(() => []),
    callRemotive(`fresher ${role}`,       "Remotive Fresher",   "#6d28d9").catch(() => []),

    // ── Arbeitnow variants ─────────────────────────────────────────────
    callArbeitnow(role,                   "Arbeitnow",          "#0ea5e9").catch(() => []),
    callArbeitnow(`junior ${role}`,       "Arbeitnow Junior",   "#38bdf8").catch(() => []),
    callArbeitnow(`graduate ${role}`,     "Arbeitnow Graduate", "#0284c7").catch(() => []),
    callArbeitnow(`trainee ${role}`,      "Arbeitnow Trainee",  "#0369a1").catch(() => []),
    callArbeitnow(`intern ${kw2}`,        "Arbeitnow Intern",   "#075985").catch(() => []),

    // ── The Muse (entry level & internship filters) ────────────────────
    callTheMuse(role,  "Entry Level", "The Muse Entry",    "#a855f7").catch(() => []),
    callTheMuse(role,  "Internship",  "The Muse Internship","#9333ea").catch(() => []),

    // ── Himalayas variants ─────────────────────────────────────────────
    callHimalayas(role,            "Himalayas",        "#14b8a6").catch(() => []),
    callHimalayas(`junior ${role}`,"Himalayas Junior", "#0d9488").catch(() => []),

    // ── Jobicy variants ────────────────────────────────────────────────
    callJobicy(role,  "",       "Jobicy",         "#ec4899").catch(() => []),
    callJobicy(role,  "junior", "Jobicy Junior",  "#db2777").catch(() => []),
    callJobicy(kw2,   "entry",  "Jobicy Entry",   "#be185d").catch(() => []),

    // ── Remote OK variants ─────────────────────────────────────────────
    callRemoteOK(role,  "Remote OK",       "#84cc16").catch(() => []),
    callRemoteOK(kw2,   "Remote OK (Alt)", "#65a30d").catch(() => []),

    // ── Working Nomads ─────────────────────────────────────────────────
    callWorkingNomads(role,  "Working Nomads",        "#f59e0b").catch(() => []),
    callWorkingNomads(kw2,   "Working Nomads Junior", "#d97706").catch(() => []),

    // ── HackerNews ─────────────────────────────────────────────────────
    callHackerNews().catch(() => []),
  ];

  const results = await Promise.allSettled(fetchers);
  const allJobs = results.filter(r => r.status === "fulfilled").flatMap(r => r.value);

  // Deduplicate by title+company (keep FIRST occurrence so portal variety is preserved)
  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (!j.title || !j.company) return false;
    const key = `${j.title.trim().toLowerCase()}|${j.company.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fresher-friendly first, then rest
  unique.sort((a, b) => {
    if (a.fresherFriendly && !b.fresherFriendly) return -1;
    if (!a.fresherFriendly && b.fresherFriendly) return 1;
    return 0;
  });

  return unique.slice(0, 120);
}

export function extractKeywords(resume) {
  const kws = ["react","node","python","java","typescript","javascript","aws","docker","machine learning","data science","devops","backend","frontend","fullstack","flutter","android","ios","django","golang","rust","sql","ux","ui","marketing","data engineer","cloud","php","ruby","swift","kotlin","c++","angular","vue","figma","seo","qa","testing","tableau","power bi","salesforce","blockchain","cybersecurity","embedded"];
  const lower = resume.toLowerCase();
  return kws.filter(k => lower.includes(k)).slice(0, 3);
}
