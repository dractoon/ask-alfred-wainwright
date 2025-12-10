const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question } = req.body;
  if(!question) return res.status(400).json({ answer: "Alfred requires a question!" });

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
    const answer = data.choices[0].message.content.trim();
    res.status(200).json({ answer });

  } catch(err) {
    console.error(err);
    res.status(500).json({ answer: "Alfred is too weary to respond." });
  }
};
