// Vercel serverless function for Ask Alfred Wainwright
// Node 18+ runtime includes native fetch

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question } = req.body;
  if (!question) return res.status(400).json({ answer: "Alfred requires a question!" });

  // Build the prompt in Alfred's style
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
        model: 'gpt-4o-mini',          // valid model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await response.json();
    console.log('OpenAI API response:', data); // Logs the full response

    // Validate the response before accessing choices
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI API response:', data);
      return res.status(500).json({ answer: "Alfred is too weary to respond." });
    }

    const answer = data.choices[0].message.content.trim();
    res.status(200).json({ answer });

  } catch (err) {
    console.error('Error calling OpenAI API:', err);
    res.status(500).json({ answer: "Alfred is too weary to respond." });
  }
};
