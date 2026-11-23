// The Ask side panel: a chat that answers from Plaza's content and shows its work.
import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Brain, Search, ArrowUp, BookmarkPlus } from 'lucide-react';
import { api } from './api.js';
import { SpaceTag, TypeBadge } from './ui.jsx';

const STARTERS = ['How many days off do I get?', 'When does firmware 4.2 reach everyone?', 'What caused the pairing outage?'];

/**
 * Shows answer text with its [n] source numbers as small chips.
 * @param {{ text: string }} props
 */
const Answer = ({ text }) => (
  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
    {text.split(/(\[\d+\]|\[M\])/).map((part, n) => {
      if (part === '[M]') return <sup key={n} title="From memory" className="mx-0.5 inline-flex rounded bg-rose-100 px-1 py-0.5 align-super text-rose-600"><Brain size={10} /></sup>;
      if (/^\[\d+\]$/.test(part)) return <sup key={n} className="mx-0.5 rounded bg-indigo-100 px-1 py-0.5 text-[10px] font-bold text-indigo-700">{part.slice(1, -1)}</sup>;
      return <span key={n}>{part}</span>;
    })}
  </p>
);

/**
 * @param {{ person: object, spaces: object[], open: (item: object) => void, onClose: () => void }} props
 */
export default function AskPanel({ person, spaces, open, onClose }) {
  const [turns, setTurns] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [turns]);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setText('');
    const turn = { question, answer: '', memory: null, search: null, sources: [], saved: [], done: false };
    setTurns((list) => [...list, turn]);
    const update = (change) => setTurns((list) => list.map((item, n) => (n === list.length - 1 ? { ...item, ...change(item) } : item)));
    try {
      await api.ask(question, (event, data) => {
        if (event === 'step' && data.name === 'memory') update(() => ({ memory: data }));
        if (event === 'step' && data.name === 'search') update(() => ({ search: data }));
        if (event === 'token') update((item) => ({ answer: item.answer + data.text }));
        if (event === 'answer') update(() => ({ answer: data.text }));
        if (event === 'sources') update(() => ({ sources: data.sources }));
        if (event === 'memory') update(() => ({ saved: data.saved }));
        if (event === 'done') update(() => ({ done: true, ms: data.ms }));
        if (event === 'error') update(() => ({ answer: `Something went wrong: ${data.message}`, done: true }));
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside id="ask-panel" className="flex w-[440px] shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white"><Sparkles size={16} /></span>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-bold">Ask Plaza</p>
          <p className="text-xs text-slate-500">Answers from your spaces, with sources</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
      </div>

      <div className="flex-1 space-y-5 overflow-auto p-5">
        {turns.length === 0 && (
          <div>
            <p className="mb-3 text-sm text-slate-500">Hi {person.name.split(' ')[0]}. Ask anything about what is in your spaces.</p>
            <div className="space-y-2">
              {STARTERS.map((starter) => (
                <button key={starter} type="button" onClick={() => ask(starter)} className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm font-medium hover:border-indigo-300 hover:bg-indigo-50">{starter}</button>
              ))}
            </div>
          </div>
        )}
        {turns.map((turn, n) => (
          <div key={n} className="space-y-2.5">
            <p className="ml-10 rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-[15px] text-white">{turn.question}</p>
            <div className="space-y-1 text-xs text-slate-500">
              {turn.memory && (
                <p className="flex items-start gap-1.5" data-step="memory">
                  <Brain size={13} className="mt-0.5 shrink-0 text-rose-500" />
                  {turn.memory.count === 0 ? 'Nothing remembered that relates to this' : <span>Remembered: {turn.memory.items.join(' · ')}</span>}
                </p>
              )}
              {turn.search && (
                <p className="flex items-center gap-1.5" data-step="search"><Search size={13} className="text-indigo-500" /> Found {turn.search.count} passages in {turn.search.ms} ms{turn.search.held > 0 && <span className="ml-1 font-semibold text-amber-600" data-held>· {turn.search.held} held back: it reads like orders, not content</span>}</p>
              )}
            </div>
            {turn.answer ? <Answer text={turn.answer} /> : <p className="animate-pulse text-sm text-slate-400">Reading…</p>}
            {turn.sources.length > 0 && (
              <ul className="space-y-1.5" data-sources>
                {turn.sources.map((source) => (
                  <li key={source.n}>
                    <button type="button" onClick={() => open({ id: source.id, type: source.type, space: source.space })} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:border-indigo-300 hover:bg-indigo-50">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 text-[11px] font-bold text-indigo-700">{source.n}</span>
                      <span className="flex-1 truncate font-medium">{source.title}</span>
                      <TypeBadge type={source.type} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {turn.saved.length > 0 && (
              <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700" data-saved>
                <BookmarkPlus size={14} className="mt-0.5 shrink-0" /> <span>Saved to memory: {turn.saved.join(' · ')}</span>
              </p>
            )}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form onSubmit={(event) => { event.preventDefault(); ask(text); }} className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 p-1.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
          <input id="ask-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask a question" autoComplete="off" className="flex-1 bg-transparent px-2.5 py-2 text-[15px] outline-none" />
          <button type="submit" disabled={busy} aria-label="Send" className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:opacity-40"><ArrowUp size={18} /></button>
        </div>
        <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">Searches only: {person.spaces.map((id) => <SpaceTag key={id} id={id} spaces={spaces} />)}</p>
      </form>
    </aside>
  );
}
