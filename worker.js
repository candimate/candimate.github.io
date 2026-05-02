/* ════════════════════════════════════
   CANDIMATE — Cloudflare Worker
   Gemini AI Proxy
   ════════════════════════════════════ */

/* ── CONFIG ── */
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ALLOWED_ORIGIN = 'https://candimate.github.io';

/* ── CACHE đơn giản trong memory (reset khi Worker restart) ── */
const cache     = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.value;
}
function setCache(key, value) {
  // Giới hạn cache tối đa 100 entry để tránh memory leak
  if (cache.size >= 100) cache.delete(cache.keys().next().value);
  cache.set(key, { value, ts: Date.now() });
}

/* ── CORS HEADERS ── */
function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/* ── SYSTEM PROMPT ── */
function buildSystemPrompt(metadata) {
  return `Bạn là trợ lý AI của Candimate — hệ thống lưu trữ ảnh sự kiện của Trường THPT Lộc Hiệp.

Nhiệm vụ của bạn:
1. Nếu người dùng hỏi về ảnh hoặc tìm kiếm ảnh → trả về JSON với key "type": "search" và "results": [danh sách albumId và photoName phù hợp nhất, tối đa 12 ảnh].
2. Nếu người dùng hỏi thông tin về sự kiện, album, trường học → trả về JSON với key "type": "answer" và "text": [câu trả lời bằng tiếng Việt, ngắn gọn, thân thiện].
3. Nếu câu hỏi không liên quan đến Candimate hay nhà trường → trả về JSON với key "type": "answer" và "text": "Mình chỉ có thể hỗ trợ các câu hỏi liên quan đến ảnh và sự kiện của Trường THPT Lộc Hiệp nhé! 😊".

QUAN TRỌNG:
- Chỉ trả về JSON thuần túy, không markdown, không backtick.
- Với "search": mỗi result có dạng { "albumId": "...", "photoName": "..." }.
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn.

Dữ liệu hiện có trong hệ thống:
${JSON.stringify(metadata, null, 2)}`;
}

/* ── MAIN HANDLER ── */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    /* Xử lý preflight CORS */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    /* Chỉ cho phép POST */
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* Parse body */
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const { query, metadata, history = [] } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* Kiểm tra cache */
    const cacheKey = query.trim().toLowerCase();
    const cached   = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ ...cached, cached: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* Xây dựng conversation history cho Gemini */
    const contents = [
      /* System prompt dưới dạng turn đầu tiên */
      {
        role: 'user',
        parts: [{ text: buildSystemPrompt(metadata || []) }],
      },
      {
        role: 'model',
        parts: [{ text: 'Đã hiểu. Tôi sẵn sàng hỗ trợ!' }],
      },
      /* Lịch sử chat (tối đa 6 turn gần nhất để tiết kiệm token) */
      ...history.slice(-6).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      /* Câu hỏi hiện tại */
      {
        role: 'user',
        parts: [{ text: query.trim() }],
      },
    ];

    /* Gọi Gemini API */
    let geminiRes;
    try {
      geminiRes = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature:     0.4,
            maxOutputTokens: 1024,
          },
        }),
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Không thể kết nối đến Gemini' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(JSON.stringify({ error: 'Gemini API error', detail: errText }), {
        status: geminiRes.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* Parse kết quả Gemini */
    let geminiData;
    try {
      geminiData = await geminiRes.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Gemini trả về dữ liệu không hợp lệ' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    /* Parse JSON từ Gemini (bỏ qua markdown fence nếu có) */
    let result;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      result        = JSON.parse(cleaned);
    } catch {
      /* Nếu Gemini không trả JSON đúng → wrap thành answer */
      result = { type: 'answer', text: rawText.trim() };
    }

    /* Lưu cache */
    setCache(cacheKey, result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  },
};
