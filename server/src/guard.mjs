// Protections for a small local web app: who may call it, how much it reads,
// what it lets into a page, and what it lets into the model's prompt.

// The largest request body the server will read.
export const MAX_BODY_BYTES = 64 * 1024;

/**
 * Decides whether a request may be handled. Plaza is a local app, so it only
 * answers to its own address, and it only takes changes sent as JSON from its own pages.
 * A page on another site can make a browser send a form to localhost; it cannot
 * send JSON with a matching Origin.
 * @param {{ method: string, headers: object }} request The incoming request.
 * @param {number} port The port the server listens on.
 * @returns {{ status: number, error: string } | null} Why it is refused, or null when it is fine.
 */
export const checkRequest = (request, port) => {
  const own = [`localhost:${port}`, `127.0.0.1:${port}`];
  if (!own.includes(request.headers.host)) return { status: 403, error: 'Plaza only answers on its local address.' };
  const { origin } = request.headers;
  if (origin && !own.some((host) => origin === `http://${host}`)) return { status: 403, error: 'Requests from other sites are not accepted.' };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const type = String(request.headers['content-type'] || '');
    const hasBody = Number(request.headers['content-length'] || 0) > 0 || request.headers['transfer-encoding'];
    if (hasBody && !type.startsWith('application/json')) return { status: 415, error: 'Send changes as JSON.' };
  }
  return null;
};

/**
 * Reads a JSON request body, refusing one that is too large.
 * @param {AsyncIterable<Buffer>} request The incoming request.
 * @param {number} [limit] Largest size in bytes.
 * @returns {Promise<object>} The parsed body, or {} when there is none.
 */
export const readBody = async (request, limit = MAX_BODY_BYTES) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('The request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The request is not valid JSON.'), { status: 400 });
  }
};

/**
 * Makes text safe to place inside HTML.
 * @param {string} text Any text, such as a chat message.
 * @returns {string} The text with HTML characters replaced.
 */
export const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

// Headers sent with every page and reply. The content policy means that even if
// a script got into a page, the browser would not run it.
export const SECURITY_HEADERS = {
  'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};

const ORDERS = [
  /\b(ignore|disregard|forget|override)\b[^.\n]{0,40}\b(instructions?|rules|prompt)\b/i,
  /\bsystem (notice|prompt|message|override)\b/i,
  /\b(to|attention|note to|message to) the (assistant|ai|model|chatbot)\b/i,
  /\bfrom now on\b[^.\n]{0,80}\b(answer|reply|respond|say|tell)\b/i,
  /\byou (must|should|will) (now |always )?(answer|reply|respond|say|tell)\b/i,
];

/**
 * Says whether a text reads like orders for the assistant instead of content.
 * Anyone who can write a message can try to steer the model this way (prompt
 * injection). This catches the plain cases; it is one layer, not a cure.
 * @param {string} text A passage about to be given to the model.
 * @returns {boolean} True when the passage should be held back.
 */
export const looksLikeOrders = (text) => ORDERS.some((pattern) => pattern.test(String(text || '')));
