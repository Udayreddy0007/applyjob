const FRESHER_KW = ["junior","entry level","entry-level","graduate","intern","fresher","trainee","associate","no experience","0-1 year","0 to 1","new grad","recent graduate","campus","apprentice"];

function isFresherFriendly(title="",desc=""){
  const t=`${title} ${desc}`.toLowerCase();
  return FRESHER_KW.some(k=>t.includes(k));
}

function normalize(job){
  return {match:null,matchReason:null,missingSkills:[],matchingSkills:[],applied:false,status:null,appliedAt:null,...job};
}

// ── 1. Remotive ────────────────────────────────────────────────────────────
async function fetchRemotive(kw){
  try{
    const r=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(kw)}&limit=15`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`remotive-${j.id}`,portal:"Remotive",portalColor:"#6366f1",
      title:j.title,company:j.company_name,location:j.candidate_required_location||"Remote",
      salary:j.salary||"Not specified",type:j.job_type||"Full-time",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5).map(t=>t.name||t),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:isFresherFriendly(j.title,j.description),
    }));
  }catch{return[];}
}

// ── 2. Arbeitnow ───────────────────────────────────────────────────────────
async function fetchArbeitnow(kw){
  try{
    const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(kw)}`);
    const d=await r.json();
    return (d.data||[]).slice(0,15).map(j=>normalize({
      id:`arbeitnow-${j.slug}`,portal:"Arbeitnow",portalColor:"#0ea5e9",
      title:j.title,company:j.company_name,location:j.location||"Remote",
      salary:"Not specified",type:j.job_types?.join(", ")||"Full-time",
      posted:new Date(j.created_at*1000).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:isFresherFriendly(j.title,j.description),
    }));
  }catch{return[];}
}

// ── 3. The Muse – Entry Level only ────────────────────────────────────────
async function fetchTheMuse(kw){
  try{
    const r=await fetch(`https://www.themuse.com/api/public/jobs?descending=true&page=1&category=${encodeURIComponent(kw)}&level=Entry+Level&api_key=public`);
    const d=await r.json();
    return (d.results||[]).slice(0,12).map(j=>normalize({
      id:`muse-${j.id}`,portal:"The Muse",portalColor:"#a855f7",
      title:j.name,company:j.company?.name||"Unknown",
      location:j.locations?.map(l=>l.name).join(", ")||"Remote",
      salary:"Not specified",type:j.type||"Full-time",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.categories||[]).slice(0,5).map(c=>c.name),
      description:(j.contents||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.refs?.landing_page||"",fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 4. Himalayas ───────────────────────────────────────────────────────────
async function fetchHimalayas(kw){
  try{
    const r=await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(kw)}&limit=12`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`himalayas-${j.id}`,portal:"Himalayas",portalColor:"#14b8a6",
      title:j.title,company:j.companyName||"Unknown",
      location:j.locationRestrictions?.join(", ")||"Remote",
      salary:j.salaryRange?`$${j.salaryRange.min}–$${j.salaryRange.max}`:"Not specified",
      type:j.jobType||"Full-time",posted:new Date(j.createdAt).toLocaleDateString(),
      tags:(j.skills||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.applicationLink||"",fresherFriendly:isFresherFriendly(j.title,j.description),
    }));
  }catch{return[];}
}

// ── 5. Jobicy ──────────────────────────────────────────────────────────────
async function fetchJobicy(kw){
  try{
    const r=await fetch(`https://jobicy.com/api/v2/remote-jobs?count=12&tag=${encodeURIComponent(kw)}`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`jobicy-${j.id}`,portal:"Jobicy",portalColor:"#ec4899",
      title:j.jobTitle,company:j.companyName||"Unknown",location:j.jobGeo||"Remote",
      salary:j.annualSalaryMin?`$${j.annualSalaryMin}–$${j.annualSalaryMax}`:"Not specified",
      type:j.jobType||"Full-time",posted:new Date(j.pubDate).toLocaleDateString(),
      tags:(j.jobIndustry||[]).slice(0,5),
      description:(j.jobDescription||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:isFresherFriendly(j.jobTitle,j.jobDescription),
    }));
  }catch{return[];}
}

// ── 6. Jobicy Junior ──────────────────────────────────────────────────────
async function fetchJobicyJunior(kw){
  try{
    const r=await fetch(`https://jobicy.com/api/v2/remote-jobs?count=12&tag=${encodeURIComponent(kw)}&level=junior`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`jobicy-jr-${j.id}`,portal:"Jobicy Junior",portalColor:"#db2777",
      title:j.jobTitle,company:j.companyName||"Unknown",location:j.jobGeo||"Remote",
      salary:j.annualSalaryMin?`$${j.annualSalaryMin}–$${j.annualSalaryMax}`:"Competitive",
      type:j.jobType||"Full-time",posted:new Date(j.pubDate).toLocaleDateString(),
      tags:(j.jobIndustry||[]).slice(0,5),
      description:(j.jobDescription||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 7. Remote OK ───────────────────────────────────────────────────────────
async function fetchRemoteOK(kw){
  try{
    const r=await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(kw)}`,{headers:{"User-Agent":"ApplyBot/1.0"}});
    const d=await r.json();
    return (Array.isArray(d)?d:[]).filter(j=>j.id).slice(0,12).map(j=>normalize({
      id:`remoteok-${j.id}`,portal:"Remote OK",portalColor:"#84cc16",
      title:j.position,company:j.company||"Unknown",location:"Remote",
      salary:j.salary_min?`$${j.salary_min}–$${j.salary_max}`:"Not specified",
      type:"Remote",posted:new Date(j.date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:isFresherFriendly(j.position,j.description),
    }));
  }catch{return[];}
}

// ── 8. Working Nomads ──────────────────────────────────────────────────────
async function fetchWorkingNomads(kw){
  try{
    const r=await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${encodeURIComponent(kw)}`);
    const d=await r.json();
    return (Array.isArray(d)?d:[]).slice(0,10).map(j=>normalize({
      id:`nomads-${j.id}`,portal:"Working Nomads",portalColor:"#f59e0b",
      title:j.title,company:j.company_name||"Unknown",location:"Remote",
      salary:"Not specified",type:"Remote",posted:new Date(j.pub_date).toLocaleDateString(),
      tags:(j.tags||"").split(",").slice(0,5).map(t=>t.trim()).filter(Boolean),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:isFresherFriendly(j.title,j.description),
    }));
  }catch{return[];}
}

// ── 9. Findwork ────────────────────────────────────────────────────────────
async function fetchFindwork(kw){
  try{
    const r=await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(kw)}&remote=true`);
    const d=await r.json();
    return (d.results||[]).slice(0,10).map(j=>normalize({
      id:`findwork-${j.id}`,portal:"Findwork",portalColor:"#22c55e",
      title:j.role,company:j.company_name||"Unknown",location:j.location||"Remote",
      salary:"Not specified",type:"Full-time",posted:new Date(j.date_posted).toLocaleDateString(),
      tags:(j.keywords||[]).slice(0,5),
      description:`${j.role} at ${j.company_name}. ${j.location||"Remote"}.`,
      url:j.url||"",fresherFriendly:isFresherFriendly(j.role,""),
    }));
  }catch{return[];}
}

// ── 10. HackerNews Jobs ────────────────────────────────────────────────────
async function fetchHackerNews(){
  try{
    const r=await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
    const ids=await r.json();
    const jobs=await Promise.all(ids.slice(0,15).map(id=>fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r=>r.json()).catch(()=>null)));
    return jobs.filter(j=>j&&j.title).map(j=>normalize({
      id:`hn-${j.id}`,portal:"HackerNews Jobs",portalColor:"#f97316",
      title:j.title.replace(/^Ask HN: |^HN: /i,""),
      company:(j.title.match(/^([^(|–-]+)/)||["","Unknown"])[1].trim(),
      location:"Remote / Various",salary:"Not specified",type:"Full-time",
      posted:new Date(j.time*1000).toLocaleDateString(),
      tags:["React","Python","Node","Go","TypeScript","AWS","Intern","Junior"].filter(t=>j.title?.toLowerCase().includes(t.toLowerCase())),
      description:(j.text||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||`https://news.ycombinator.com/item?id=${j.id}`,
      fresherFriendly:isFresherFriendly(j.title,j.text||""),
    }));
  }catch{return[];}
}

// ── 11. Internships via Remotive ───────────────────────────────────────────
async function fetchInternships(kw){
  try{
    const r=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("intern "+kw)}&limit=12`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`intern-${j.id}`,portal:"Internships",portalColor:"#f43f5e",
      title:j.title,company:j.company_name,location:j.candidate_required_location||"Remote",
      salary:j.salary||"Stipend",type:"Internship",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5).map(t=>t.name||t),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 12. Entry Level via Remotive ───────────────────────────────────────────
async function fetchEntryLevel(kw){
  try{
    const r=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("junior "+kw)}&limit=12`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`entry-${j.id}`,portal:"Entry Level",portalColor:"#10b981",
      title:j.title,company:j.company_name,location:j.candidate_required_location||"Remote",
      salary:j.salary||"Not specified",type:j.job_type||"Full-time",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5).map(t=>t.name||t),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 13. Graduate Jobs via Arbeitnow ───────────────────────────────────────
async function fetchGraduateJobs(kw){
  try{
    const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("graduate "+kw)}`);
    const d=await r.json();
    return (d.data||[]).slice(0,12).map(j=>normalize({
      id:`grad-${j.slug}`,portal:"Graduate Jobs",portalColor:"#6d28d9",
      title:j.title,company:j.company_name,location:j.location||"Remote",
      salary:"Not specified",type:j.job_types?.join(", ")||"Full-time",
      posted:new Date(j.created_at*1000).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 14. Fresher Jobs via Arbeitnow ─────────────────────────────────────────
async function fetchFresherJobs(kw){
  try{
    const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("fresher "+kw)}`);
    const d=await r.json();
    return (d.data||[]).slice(0,12).map(j=>normalize({
      id:`fresher-${j.slug}`,portal:"Fresher Jobs",portalColor:"#059669",
      title:j.title,company:j.company_name,location:j.location||"Remote",
      salary:"Not specified",type:j.job_types?.join(", ")||"Full-time",
      posted:new Date(j.created_at*1000).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 15. Trainee Jobs ──────────────────────────────────────────────────────
async function fetchTraineeJobs(kw){
  try{
    const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("trainee "+kw)}`);
    const d=await r.json();
    return (d.data||[]).slice(0,10).map(j=>normalize({
      id:`trainee-${j.slug}`,portal:"Trainee",portalColor:"#0891b2",
      title:j.title,company:j.company_name,location:j.location||"Remote",
      salary:"Not specified",type:j.job_types?.join(", ")||"Full-time",
      posted:new Date(j.created_at*1000).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 16. Campus/New Grad Jobs ───────────────────────────────────────────────
async function fetchNewGrad(kw){
  try{
    const r=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("new grad "+kw)}&limit=10`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`newgrad-${j.id}`,portal:"New Grad",portalColor:"#7c3aed",
      title:j.title,company:j.company_name,location:j.candidate_required_location||"Remote",
      salary:j.salary||"Not specified",type:j.job_type||"Full-time",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5).map(t=>t.name||t),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 17. Joblist (aggregate) ────────────────────────────────────────────────
async function fetchJoblist(kw){
  try{
    const r=await fetch(`https://api.joblist.app/api/jobs?query=${encodeURIComponent(kw)}&entry_level=true`);
    const d=await r.json();
    return (d.jobs||d.results||[]).slice(0,10).map(j=>normalize({
      id:`joblist-${j.id}`,portal:"Joblist",portalColor:"#0369a1",
      title:j.title||j.name,company:j.company||"Unknown",location:j.location||"Remote",
      salary:j.salary||"Not specified",type:j.type||"Full-time",
      posted:j.date||j.posted||"Recently",
      tags:(j.tags||j.skills||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||j.link||"",fresherFriendly:isFresherFriendly(j.title,j.description),
    }));
  }catch{return[];}
}

// ── 18. Wellfound (AngelList) – Startup jobs ───────────────────────────────
async function fetchWellfound(kw){
  try{
    const r=await fetch(`https://wellfound.com/company_roles?query=${encodeURIComponent(kw)}&role_type=engineer`);
    const d=await r.json();
    return (d.startup_roles||d.jobs||[]).slice(0,10).map(j=>normalize({
      id:`wellfound-${j.id}`,portal:"Wellfound",portalColor:"#ef4444",
      title:j.title||j.role,company:j.startup?.name||j.company||"Startup",
      location:j.location||"Remote",salary:j.compensation||"Equity + Salary",
      type:"Full-time",posted:"Recently",
      tags:(j.skills||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||`https://wellfound.com/jobs`,fresherFriendly:isFresherFriendly(j.title||"",j.description||""),
    }));
  }catch{return[];}
}

// ── 19. No Whiteboard (dev-friendly small cos) ────────────────────────────
async function fetchNoWhiteboard(kw){
  try{
    const r=await fetch("https://raw.githubusercontent.com/poteto/hiring-without-whiteboards/master/README.md");
    const text=await r.text();
    const lines=text.split("\n").filter(l=>l.includes("|")&&l.toLowerCase().includes(kw.toLowerCase()));
    return lines.slice(0,8).map((l,i)=>{
      const parts=l.split("|").map(p=>p.trim()).filter(Boolean);
      const company=parts[0]?.replace(/\[([^\]]+)\].*/,"$1")||"Company";
      const url=(parts[0]?.match(/\(([^)]+)\)/)||[])[1]||"";
      return normalize({
        id:`nwb-${i}`,portal:"No Whiteboard",portalColor:"#16a34a",
        title:`${kw} Developer`,company,location:"Remote / Various",
        salary:"Not specified",type:"Full-time",posted:"Active",
        tags:[kw,"developer-friendly","no whiteboard"],
        description:`${company} is known for developer-friendly interviews and actively hires freshers and junior engineers.`,
        url,fresherFriendly:true,
      });
    });
  }catch{return[];}
}

// ── 20. Remotive Fresher specific ─────────────────────────────────────────
async function fetchRemotiveFresher(kw){
  try{
    const r=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent("entry level "+kw)}&limit=10`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`remote-fresh-${j.id}`,portal:"Remote Fresher",portalColor:"#0284c7",
      title:j.title,company:j.company_name,location:j.candidate_required_location||"Remote",
      salary:j.salary||"Not specified",type:j.job_type||"Full-time",
      posted:new Date(j.publication_date).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5).map(t=>t.name||t),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 21. Arbeitnow Entry Level ──────────────────────────────────────────────
async function fetchArbeitnowEntry(kw){
  try{
    const r=await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent("entry level "+kw)}`);
    const d=await r.json();
    return (d.data||[]).slice(0,10).map(j=>normalize({
      id:`arb-entry-${j.slug}`,portal:"Arbeitnow Entry",portalColor:"#1d4ed8",
      title:j.title,company:j.company_name,location:j.location||"Remote",
      salary:"Not specified",type:j.job_types?.join(", ")||"Full-time",
      posted:new Date(j.created_at*1000).toLocaleDateString(),
      tags:(j.tags||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url,fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 22. Jobicy Entry Level ─────────────────────────────────────────────────
async function fetchJobicyEntry(kw){
  try{
    const r=await fetch(`https://jobicy.com/api/v2/remote-jobs?count=10&tag=${encodeURIComponent(kw)}&level=entry`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`jobicy-entry-${j.id}`,portal:"Jobicy Entry",portalColor:"#be185d",
      title:j.jobTitle,company:j.companyName||"Unknown",location:j.jobGeo||"Remote",
      salary:j.annualSalaryMin?`$${j.annualSalaryMin}–$${j.annualSalaryMax}`:"Not specified",
      type:j.jobType||"Full-time",posted:new Date(j.pubDate).toLocaleDateString(),
      tags:(j.jobIndustry||[]).slice(0,5),
      description:(j.jobDescription||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 23. Himalayas Junior ───────────────────────────────────────────────────
async function fetchHimalayasJunior(kw){
  try{
    const r=await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent("junior "+kw)}&limit=10`);
    const d=await r.json();
    return (d.jobs||[]).map(j=>normalize({
      id:`him-jr-${j.id}`,portal:"Himalayas Junior",portalColor:"#0f766e",
      title:j.title,company:j.companyName||"Unknown",
      location:j.locationRestrictions?.join(", ")||"Remote",
      salary:j.salaryRange?`$${j.salaryRange.min}–$${j.salaryRange.max}`:"Not specified",
      type:j.jobType||"Full-time",posted:new Date(j.createdAt).toLocaleDateString(),
      tags:(j.skills||[]).slice(0,5),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.applicationLink||"",fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── 24. Remote Fresher (Working Nomads junior) ─────────────────────────────
async function fetchNomadsJunior(kw){
  try{
    const r=await fetch(`https://www.workingnomads.com/api/exposed_jobs/?category=${encodeURIComponent("junior "+kw)}`);
    const d=await r.json();
    return (Array.isArray(d)?d:[]).slice(0,10).map(j=>normalize({
      id:`nomads-jr-${j.id}`,portal:"Nomads Junior",portalColor:"#d97706",
      title:j.title,company:j.company_name||"Unknown",location:"Remote",
      salary:"Not specified",type:"Remote",posted:new Date(j.pub_date).toLocaleDateString(),
      tags:(j.tags||"").split(",").slice(0,5).map(t=>t.trim()).filter(Boolean),
      description:(j.description||"").replace(/<[^>]+>/g,"").slice(0,1500),
      url:j.url||"",fresherFriendly:true,
    }));
  }catch{return[];}
}

// ── MAIN FETCHER ───────────────────────────────────────────────────────────
export async function fetchJobsFromAPI(resumeData={}){
  const role=resumeData.primaryRole||"software engineer";
  const kws=resumeData.keywords||[role];
  const kw1=role;
  const kw2=kws[0]||role;
  const kw3=kws[1]||role;

  const fetchers=[
    // Core portals
    fetchRemotive(kw1),
    fetchRemotive(kw2),
    fetchArbeitnow(kw1),
    fetchArbeitnow(kw2),
    fetchTheMuse(kw1),
    fetchHimalayas(kw1),
    fetchHimalayas(kw2),
    fetchJobicy(kw1),
    fetchJobicy(kw2),
    fetchJobicyJunior(kw1),
    fetchRemoteOK(kw3),
    fetchWorkingNomads(kw1),
    fetchFindwork(kw1),
    fetchHackerNews(),
    // Fresher-specific
    fetchInternships(kw1),
    fetchInternships(kw2),
    fetchEntryLevel(kw1),
    fetchEntryLevel(kw2),
    fetchGraduateJobs(kw1),
    fetchFresherJobs(kw1),
    fetchTraineeJobs(kw1),
    fetchNewGrad(kw1),
    fetchRemotiveFresher(kw1),
    fetchArbeitnowEntry(kw1),
    fetchJobicyEntry(kw1),
    fetchHimalayasJunior(kw1),
    fetchNomadsJunior(kw1),
    // Startup & extra
    fetchNoWhiteboard(kw1),
    fetchWellfound(kw1),
    fetchJoblist(kw1),
  ];

  const results=await Promise.allSettled(fetchers);
  const allJobs=results.filter(r=>r.status==="fulfilled").flatMap(r=>r.value);

  // Deduplicate
  const seen=new Set();
  const unique=allJobs.filter(j=>{
    if(!j.title||!j.company)return false;
    const key=`${j.title}-${j.company}`.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });

  // Fresher-friendly first
  unique.sort((a,b)=>{
    if(a.fresherFriendly&&!b.fresherFriendly)return -1;
    if(!a.fresherFriendly&&b.fresherFriendly)return 1;
    return 0;
  });

  return unique.slice(0,120);
}

export function extractKeywords(resume){
  const kws=["react","node","python","java","typescript","javascript","aws","docker","kubernetes","machine learning","data science","devops","backend","frontend","fullstack","flutter","ios","android","django","fastapi","golang","rust","sql","product manager","designer","ux","ui","marketing","data engineer","cloud","php","ruby","swift","kotlin","unity","wordpress","c++","angular","vue","spring","express","mongodb","postgresql","firebase","graphql","next.js","nuxt","tailwind","figma","sketch","adobe","seo","content","copywriting","business analyst","qa","testing","automation","embedded","blockchain","cybersecurity","salesforce","sap","erp","tableau","power bi","excel","r language"];
  const lower=resume.toLowerCase();
  return kws.filter(k=>lower.includes(k)).slice(0,3);
}
