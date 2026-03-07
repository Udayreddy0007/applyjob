const OPENAI_MODEL = "gpt-4o";

/**
 * Call the OpenAI ChatGPT API.
 */
export async function callOpenAI(prompt, systemPrompt = "") {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error("Missing OpenAI API key. Set REACT_APP_OPENAI_API_KEY in your .env file.");
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: OPENAI_MODEL, max_tokens: 1000, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function matchResumeToJob(resume, job) {
  const result = await callOpenAI(
    `Score resume-to-job match 0-100. Reply ONLY with a JSON: {"score": number, "reason": "one short sentence"}.\n\nRESUME:\n${resume.slice(0, 1500)}\n\nJOB:\n${job.title} at ${job.company}\n${job.description.slice(0, 800)}`,
    "You are a recruiting AI. Return only valid JSON, no markdown."
  );
  const clean = result.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function analyzeResume(resume) {
  return callOpenAI(
    `Analyze this resume and give a brief structured summary: key skills, experience level, strengths, and 3 improvement suggestions. Keep it concise.\n\nRESUME:\n${resume.slice(0, 3000)}`,
    "You are an expert career coach. Be concise, professional, and actionable."
  );
}

export async function enhanceResumeForJob(resume, job) {
  return callOpenAI(
    `Rewrite and enhance this resume to better match the job description. Highlight relevant skills, reword bullet points, and add quantifiable achievements where possible.\n\nJOB: ${job.title} at ${job.company}\nDESCRIPTION: ${job.description.slice(0, 1000)}\n\nORIGINAL RESUME:\n${resume.slice(0, 2000)}`,
    "You are an expert resume writer. Return the enhanced resume text only."
  );
}

export async function generateCoverLetter(resume, job) {
  return callOpenAI(
    `Write a compelling, personalized cover letter for this job application. 3 short paragraphs, professional tone, highlight key matching skills.\n\nJOB: ${job.title} at ${job.company}\nDESCRIPTION: ${job.description.slice(0, 800)}\n\nRESUME SUMMARY:\n${resume.slice(0, 1000)}`,
    "You are an expert cover letter writer. Be specific and compelling."
  );
}