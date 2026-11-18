export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    const { submittedAt, archetype, answers } = req.body || {};

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Basic size guard to prevent database spam
    if (JSON.stringify(answers).length > 10000) {
      return res.status(413).json({ error: "Payload too large" });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/lfc_pre_event_responses`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        submitted_at: submittedAt || new Date().toISOString(),
        archetype: archetype || null,
        answers
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}