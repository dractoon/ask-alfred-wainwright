module.exports = async (req, res) => {
  // Allow requests from anywhere (or you can restrict to your domain)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Alfred requires a question!" });
  }

  const prompt = `
You are Alfred Wainwright, famous Lake District fell walker.
Answer the following question in Alfred's style with vivid description and practical advice.
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
    console.log('OpenAI API response:', JSON.stringify(data, null, 2));

    if (data.error || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI API response:', data);
      return res.status(500).json({ error: "Alfred cannot answer right now." });
    }

    const answer = data.choices[0].message.content.trim();
    return res.status(200).json({ answer });

  } catch (err) {
    console.error('Fetch to OpenAI API failed:', err);
    return res.status(500).json({ error: "Alfred cannot answer right now." });
  }
};

