// api/ask.js
export default async function handler(req, res) {
  // 1️⃣ Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your GitHub Pages URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2️⃣ Handle preflight OPTIONS request immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3️⃣ Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 4️⃣ Extract question from request
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Alfred requires a question!" });
  }

  const prompt = `
You are Alfred Wainwright, famous Lake District fell walker.
Answer the following question in Alfred's style with vivid description and practical advice, keep the response short.
Only answer questions about Lake District fells, walking routes, or landscapes. Refuse if unrelated.

Question: "${question}"
Answer:
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400  
        
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Alfred cannot answer right now." });
    }

    const answer = data.choices[0].message.content.trim();
    return res.status(200).json({ answer });

  } catch (err) {
    console.error('OpenAI fetch error:', err);
    return res.status(500).json({ error: "Alfred cannot answer right now." });
  }
}
