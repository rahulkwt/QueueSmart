const GEMINI_MODEL = "gemini-2.5-flash-lite";

function getApiUrl() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in .env");
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

function buildSystemPrompt(role, dbContext) {
  const roleSection =
    role === "admin"
      ? `You are assisting an administrator. Admins can manage services (add/edit/delete), manage queues (serve next customer, remove customers, reorder), and view the dashboard. Admin pages: Dashboard (/portal/admin), Queue Management (/portal/admin/queue-management), Service Management (/portal/admin/service-management).`
      : `You are assisting a user. Users can view available services, join or leave queues, and check their queue status. User pages: Dashboard (/portal/user), Queue Status (/portal/user/queue-status), Queue History (/portal/user/history).`;

  return `You are QueueSmart AI, a helpful assistant embedded in QueueSmart, a hospital queue management system.
${roleSection}

Current system state (live data):
${dbContext}

Guidelines:
- Be concise and actionable — one or two sentences when possible.
- When asked which service needs attention, rank by pending count from the live data above.
- Do not invent queue numbers or data not shown above.
- Help with navigation by referencing the page paths listed above.`;
}

const HISTORY_WINDOW = 6; // keep last 3 exchanges (6 turns) to cap input tokens

export async function callGemini(message, history, role, dbContext) {
  const systemPrompt = buildSystemPrompt(role, dbContext);

  // Trim history to the most recent window — older turns rarely affect the next answer
  const recentHistory = history.slice(-HISTORY_WINDOW);

  const contents = recentHistory.map((h) => ({
    role: h.role,
    parts: [{ text: h.text }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 150 },
  };

  const res = await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
