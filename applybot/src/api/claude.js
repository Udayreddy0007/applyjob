const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/**
 * Call the Anthropic Claude API.
 * @param {string} prompt - The user prompt
 * @param {string} systemPrompt - Optional system prompt
 * @returns {Promise<string>} - The model's text response
 */
export async function callClaude(prompt, systemPrompt = "") {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Missing Anthropic API key. Set REACT_APP_ANTHROPIC_API_KEY in your .env file.");
  }

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  };

  if (systemPrompt) body.system = systemPrompt;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

/**
 * Score a resume against a job description.
 */
export async function matchResumeToJob(resume, job) {
  const result = await callClaude(
    `Score resume-to-job match 0-100. Reply ONLY with a JSON: {"score": number, "reason": "one short sentence"}.\n\nRESUME:\n${resume.slice(0, 1500)}\n\nJOB:\n${job.title} at ${job.company}\n${job.description.slice(0, 800)}`,
    "You are a recruiting AI. Return only valid JSON, no markdown."
  );
  const clean = result.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/**
 * Analyze a resume for strengths, skills, and improvement tips.
 */
export async function analyzeResume(resume) {
  return callClaude(
    `Analyze this resume and give a brief structured summary: key skills, experience level, strengths, and 3 improvement suggestions. Keep it concise.\n\nRESUME:\n${resume.slice(0, 3000)}`,
    "You are an expert career coach. Be concise, professional, and actionable."
  );
}

/**
 * Rewrite a resume to better match a specific job.
 */
export async function enhanceResumeForJob(resume, job) {
  return callClaude(
    `Rewrite and enhance this resume to better match the job description. Highlight relevant skills, reword bullet points, and add quantifiable achievements where possible. Keep the same general structure.\n\nJOB: ${job.title} at ${job.company}\nDESCRIPTION: ${job.description.slice(0, 1000)}\n\nORIGINAL RESUME:\n${resume.slice(0, 2000)}`,
    "You are an expert resume writer. Return the enhanced resume text only."
  );
}

/**
 * Generate a cover letter for a job using the candidate's resume.
 */
export async function generateCoverLetter(resume, job) {
  return callClaude(
    `Write a compelling, personalized cover letter for this job application. 3 short paragraphs, professional tone, highlight key matching skills.\n\nJOB: ${job.title} at ${job.company}\nDESCRIPTION: ${job.description.slice(0, 800)}\n\nRESUME SUMMARY:\n${resume.slice(0, 1000)}`,
    "You are an expert cover letter writer. Be specific and compelling."
  );
}
