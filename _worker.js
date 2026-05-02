export default {
  async fetch(request, env) {
    // Chỉ cho phép web gọi đến
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://candimate.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      const { prompt } = await request.json();
      
      // Gọi trực tiếp API của Google
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const reply = data.candidates[0].content.parts[0].text;

      return new Response(JSON.stringify({ reply }), { headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
