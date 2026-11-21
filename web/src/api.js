// Calls to the Plaza server. Every call says who the current person is.
let currentUser = 'ava';

export const setUser = (id) => { currentUser = id; };

const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', 'x-user': currentUser, ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

const queryString = (params) => new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();

export const api = {
  people: () => request('/api/people'),
  search: (params) => request(`/api/search?${queryString(params)}`),
  suggest: (q) => request(`/api/suggest?${queryString({ q })}`),
  list: (params) => request(`/api/list?${queryString(params)}`),
  content: (id) => request(`/api/content?${queryString({ id })}`),
  sendMessage: (space, text) => request('/api/messages', { method: 'POST', body: JSON.stringify({ space, text }) }),
  memory: () => request('/api/memory'),
  forget: (id) => request(`/api/memory?${queryString({ id })}`, { method: 'DELETE' }),

  /**
   * Asks a question and calls `onEvent` for every step the server reports.
   * @param {string} question The question.
   * @param {(event: string, data: object) => void} onEvent Receives 'step', 'token', 'sources', 'memory', 'done' or 'error'.
   * @returns {Promise<void>} Settles when the answer is complete.
   */
  ask: async (question, onEvent) => {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user': currentUser },
      body: JSON.stringify({ question }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop();
      for (const block of blocks) {
        const event = block.match(/^event: (.+)$/m)?.[1];
        const data = block.match(/^data: (.+)$/m)?.[1];
        if (event && data) onEvent(event, JSON.parse(data));
      }
    }
  },
};
