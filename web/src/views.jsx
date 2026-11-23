// One component per screen.
import { useEffect, useRef, useState } from 'react';
import { MapPin, Send, Trash2, Clock, Zap } from 'lucide-react';
import { api } from './api.js';
import { TYPES, SPACE_DOT, Avatar, Empty, SpaceTag, TypeBadge, day, longDay, time } from './ui.jsx';

/**
 * Loads a list from the server and reloads when its inputs change.
 * @param {object} params Query for /api/list.
 * @param {any[]} deps Values that should trigger a reload.
 * @returns {[object[], () => void]} The items and a reload function.
 */
const useList = (params, deps) => {
  const [items, setItems] = useState([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let stale = false;
    api.list(params).then((data) => { if (!stale) setItems(data.items); });
    return () => { stale = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [items, () => setTick((n) => n + 1)];
};

/**
 * Row of buttons to pick one space, or all of them.
 * @param {{ spaces: object[], value: string, onChange: (id: string) => void, all?: boolean }} props
 */
const SpacePicker = ({ spaces, value, onChange, all = true }) => (
  <div className="flex flex-wrap gap-2">
    {all && (
      <button type="button" onClick={() => onChange('')} className={`rounded-full px-3 py-1 text-sm font-medium ${value === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>All my spaces</button>
    )}
    {spaces.map((space) => (
      <button key={space.id} type="button" data-space={space.id} onClick={() => onChange(space.id)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${value === space.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
        <span className={`h-2 w-2 rounded-full ${SPACE_DOT[space.id]}`} /> {space.name}
      </button>
    ))}
  </div>
);

const Page = ({ title, subtitle, children, actions }) => (
  <div className="mx-auto max-w-6xl px-8 py-7">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

/** Home: what is coming up and what is new in your spaces. */
export const HomeView = ({ person, allSpaces, open, go }) => {
  const [events] = useList({ type: 'event', size: 5 }, [person.id]);
  const [documents] = useList({ type: 'document', size: 5 }, [person.id]);
  const [topics] = useList({ type: 'topic', size: 5 }, [person.id]);
  const section = (title, view, items, render) => (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
        <button type="button" onClick={() => go(view)} className="text-sm font-semibold text-indigo-600 hover:underline">See all</button>
      </div>
      <ul className="divide-y divide-slate-100">{items.map(render)}</ul>
    </Card>
  );
  return (
    <Page title={`Good to see you, ${person.name.split(' ')[0]}`} subtitle={`You are in ${person.spaces.length} spaces. Search covers all of them, and nothing else.`}>
      <div className="grid grid-cols-3 gap-5">
        {section('Coming up', 'events', events, (item) => (
          <li key={item.id}><button type="button" onClick={() => open(item)} className="w-full py-2.5 text-left hover:text-indigo-700">
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="text-xs text-slate-500">{longDay(item.starts)} · {time(item.starts)}</span>
          </button></li>
        ))}
        {section('New documents', 'documents', documents, (item) => (
          <li key={item.id}><button type="button" onClick={() => open(item)} className="w-full py-2.5 text-left hover:text-indigo-700">
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="flex items-center gap-2 text-xs text-slate-500"><SpaceTag id={item.space} spaces={allSpaces} /> · {day(item.created)}</span>
          </button></li>
        ))}
        {section('Active discussions', 'discussions', topics, (item) => (
          <li key={item.id}><button type="button" onClick={() => open(item)} className="w-full py-2.5 text-left hover:text-indigo-700">
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="flex items-center gap-2 text-xs text-slate-500"><SpaceTag id={item.space} spaces={allSpaces} /> · {item.author_name}</span>
          </button></li>
        ))}
      </div>
    </Page>
  );
};

const RANGES = [
  { id: '', label: 'Any time' },
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
];

/** Search results across every module, with chips, a date range and the hybrid switch. */
export const SearchView = ({ query, allSpaces, open }) => {
  const [type, setType] = useState('');
  const [space, setSpace] = useState('');
  const [range, setRange] = useState('');
  const [mode, setMode] = useState('keyword');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stale = false;
    const from = range ? new Date(Date.now() - Number(range) * 86400000).toISOString() : '';
    api.search({ q: query, type, space, from, mode })
      .then((data) => { if (!stale) { setResult(data); setError(''); } })
      .catch((problem) => { if (!stale) setError(problem.message); });
    return () => { stale = true; };
  }, [query, type, space, range, mode]);

  if (error) return <Page title="Search"><Empty>{error}</Empty></Page>;
  if (!result) return <Page title="Searching…" />;
  const chip = (active) => `flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`;

  return (
    <Page
      title={<>Results for “{query}”</>}
      subtitle={<span id="search-stats">{result.total} results in your spaces · OpenSearch took {result.took} ms</span>}
      actions={(
        <div className="flex items-center rounded-xl bg-slate-200/70 p-1 text-sm font-semibold">
          <button type="button" data-mode="keyword" onClick={() => setMode('keyword')} className={`rounded-lg px-3 py-1.5 ${mode === 'keyword' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Words</button>
          <button type="button" data-mode="hybrid" onClick={() => setMode('hybrid')} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${mode === 'hybrid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}><Zap size={14} /> Words + meaning</button>
        </div>
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setType('')} className={chip(type === '')}>Everything</button>
        {Object.entries(TYPES).filter(([id]) => result.types[id]).map(([id, info]) => (
          <button key={id} type="button" data-type={id} onClick={() => setType(type === id ? '' : id)} className={chip(type === id)}>
            <info.icon size={14} /> {info.label} <span className="opacity-60">{result.types[id]}</span>
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {Object.keys(result.spaces).map((id) => (
          <button key={id} type="button" data-space={id} onClick={() => setSpace(space === id ? '' : id)} className={chip(space === id)}>
            <span className={`h-2 w-2 rounded-full ${SPACE_DOT[id]}`} /> {allSpaces.find((item) => item.id === id)?.name} <span className="opacity-60">{result.spaces[id]}</span>
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-slate-300" />
        {RANGES.map((item) => (
          <button key={item.id} type="button" onClick={() => setRange(item.id)} className={chip(range === item.id)}><Clock size={13} /> {item.label}</button>
        ))}
      </div>

      {result.hits.length === 0 && <Empty>Nothing in your spaces matches. Try other words, or switch on “Words + meaning”.</Empty>}
      <ul id="hits" className="space-y-3">
        {result.hits.map((hit) => (
          <li key={hit.id}>
            <button type="button" onClick={() => open(hit)} className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md">
              <span className="mb-1.5 flex items-center gap-3">
                <TypeBadge type={hit.type} />
                <SpaceTag id={hit.space} spaces={allSpaces} />
                <span className="text-xs text-slate-400">{hit.author_name ? `${hit.author_name} · ` : ''}{day(hit.created)}</span>
              </span>
              {hit.title && <span className="block text-[15px] font-bold" dangerouslySetInnerHTML={{ __html: hit.titleHtml }} />}
              <span className="mt-0.5 block text-sm leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: hit.snippetHtml }} />
            </button>
          </li>
        ))}
      </ul>
    </Page>
  );
};

const ListPane = ({ items, selectedId, onPick, render }) => (
  <Card className="h-fit overflow-hidden">
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onPick(item)} className={`block w-full px-4 py-3 text-left transition hover:bg-slate-50 ${selectedId === item.id ? 'bg-indigo-50' : ''}`}>{render(item)}</button>
        </li>
      ))}
    </ul>
  </Card>
);

/** Documents: a list on the left, the chosen document on the right. */
export const DocumentsView = ({ person, spaces, allSpaces, selected }) => {
  const [space, setSpace] = useState('');
  const [items] = useList({ type: 'document', space }, [person.id, space]);
  const [current, setCurrent] = useState(null);
  useEffect(() => { if (selected?.type === 'document') api.content(selected.id).then(setCurrent).catch(() => {}); }, [selected]);
  const shown = current || items[0];
  return (
    <Page title="Documents" subtitle="Pages and files shared in your spaces.">
      <div className="mb-4"><SpacePicker spaces={spaces} value={space} onChange={(id) => { setSpace(id); setCurrent(null); }} /></div>
      <div className="grid grid-cols-[340px_1fr] gap-5">
        <ListPane items={items} selectedId={shown?.id} onPick={setCurrent} render={(item) => (
          <>
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500"><SpaceTag id={item.space} spaces={allSpaces} /> · {day(item.created)}</span>
          </>
        )} />
        {shown ? (
          <Card className="p-8">
            <div className="mb-2 flex items-center gap-3"><SpaceTag id={shown.space} spaces={allSpaces} />{shown.tags?.map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">#{tag}</span>)}</div>
            <h2 id="doc-title" className="text-2xl font-extrabold tracking-tight">{shown.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{shown.author_name} · updated {longDay(shown.created)}</p>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-700">{shown.body.split(/\n\s*\n/).map((paragraph, n) => <p key={n}>{paragraph}</p>)}</div>
          </Card>
        ) : <Empty>No documents here yet.</Empty>}
      </div>
    </Page>
  );
};

/** Discussions: topics on the left, the thread on the right. */
export const DiscussionsView = ({ person, spaces, allSpaces, selected }) => {
  const [space, setSpace] = useState('');
  const [items] = useList({ type: 'topic', space }, [person.id, space]);
  const [currentId, setCurrentId] = useState(null);
  useEffect(() => {
    if (selected?.type === 'topic') setCurrentId(selected.id);
    if (selected?.type === 'reply') setCurrentId(selected.parent_id);
  }, [selected]);
  const topicId = currentId || items[0]?.id;
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  useEffect(() => {
    if (!topicId) return;
    api.content(topicId).then(setTopic).catch(() => setTopic(null));
    api.list({ type: 'reply', parent: topicId }).then((data) => setReplies(data.items));
  }, [topicId]);
  const post = (item, highlight) => (
    <div key={item.id} className={`flex gap-3 rounded-xl p-3 ${highlight ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
      <Avatar name={item.author_name} />
      <div>
        <p className="text-sm"><span className="font-semibold">{item.author_name}</span> <span className="text-xs text-slate-400">{day(item.created)}, {time(item.created)}</span></p>
        <p className="mt-0.5 text-[15px] leading-relaxed text-slate-700">{item.body}</p>
      </div>
    </div>
  );
  return (
    <Page title="Discussions" subtitle="Questions and decisions, kept where the next person can find them.">
      <div className="mb-4"><SpacePicker spaces={spaces} value={space} onChange={(id) => { setSpace(id); setCurrentId(null); }} /></div>
      <div className="grid grid-cols-[340px_1fr] gap-5">
        <ListPane items={items} selectedId={topicId} onPick={(item) => setCurrentId(item.id)} render={(item) => (
          <>
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500"><SpaceTag id={item.space} spaces={allSpaces} /> · {item.author_name} · {day(item.created)}</span>
          </>
        )} />
        {topic ? (
          <Card className="p-6">
            <div className="mb-1"><SpaceTag id={topic.space} spaces={allSpaces} /></div>
            <h2 id="topic-title" className="mb-3 text-xl font-extrabold tracking-tight">{topic.title}</h2>
            <div className="space-y-1">{post(topic, false)}{replies.map((reply) => post(reply, selected?.id === reply.id))}</div>
          </Card>
        ) : <Empty>No discussions here yet.</Empty>}
      </div>
    </Page>
  );
};

/** Events: an agenda grouped by day. */
export const EventsView = ({ person, spaces, allSpaces, selected }) => {
  const [space, setSpace] = useState('');
  const [items] = useList({ type: 'event', space }, [person.id, space]);
  const days = [];
  for (const item of items) {
    const label = longDay(item.starts);
    if (days.at(-1)?.label !== label) days.push({ label, items: [] });
    days.at(-1).items.push(item);
  }
  return (
    <Page title="Events" subtitle="What is coming up in your spaces.">
      <div className="mb-5"><SpacePicker spaces={spaces} value={space} onChange={setSpace} /></div>
      <div className="space-y-5">
        {days.map((group) => (
          <div key={group.label} className="grid grid-cols-[200px_1fr] gap-5">
            <p className="pt-3 text-sm font-bold text-slate-500">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <Card key={item.id} className={`flex items-start gap-4 p-4 ${selected?.id === item.id ? 'ring-2 ring-amber-300' : ''}`}>
                  <span className="w-20 shrink-0 pt-0.5 text-sm font-semibold text-indigo-700">{time(item.starts)}</span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-bold">{item.title}</span>
                    <span className="block text-sm text-slate-600">{item.body}</span>
                    <span className="mt-1 flex items-center gap-3 text-xs text-slate-500"><SpaceTag id={item.space} spaces={allSpaces} /><span className="inline-flex items-center gap-1"><MapPin size={12} /> {item.place}</span></span>
                  </span>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {days.length === 0 && <Empty>No upcoming events.</Empty>}
      </div>
    </Page>
  );
};

/** Messages: one chat per space. A sent message can be found by search at once. */
export const MessagesView = ({ person, spaces, selected }) => {
  const [space, setSpace] = useState(selected?.type === 'message' ? selected.space : spaces[0]?.id);
  const [items, reload] = useList({ type: 'message', space, size: 200 }, [person.id, space]);
  const [text, setText] = useState('');
  const bottom = useRef(null);
  const ordered = [...items].reverse();
  useEffect(() => { if (!selected) bottom.current?.scrollIntoView({ block: 'end' }); }, [items, selected]);
  useEffect(() => { if (selected?.type === 'message') document.getElementById(`message-${selected.id}`)?.scrollIntoView({ block: 'center' }); }, [items, selected]);

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    await api.sendMessage(space, text);
    setText('');
    reload();
  };
  let lastDay = '';
  return (
    <Page title="Messages" subtitle="Quick talk, one room per space.">
      <div className="mb-4"><SpacePicker spaces={spaces} value={space} onChange={setSpace} all={false} /></div>
      <Card className="flex h-[calc(100vh-260px)] flex-col">
        <div id="messages" className="flex-1 space-y-1 overflow-auto p-5">
          {ordered.map((item) => {
            const label = longDay(item.created);
            const divider = label !== lastDay;
            lastDay = label;
            return (
              <div key={item.id} id={`message-${item.id}`}>
                {divider && <p className="my-3 text-center text-xs font-semibold text-slate-400">{label}</p>}
                <div className={`flex gap-3 rounded-xl px-2 py-1.5 ${selected?.id === item.id ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
                  <Avatar name={item.author_name} />
                  <div>
                    <p className="text-sm"><span className="font-semibold">{item.author_name}</span> <span className="text-xs text-slate-400">{time(item.created)}</span></p>
                    <p className="text-[15px] text-slate-700">{item.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
          <input id="message-input" value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message ${spaces.find((item) => item.id === space)?.name || ''}`} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-[15px] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"><Send size={15} /> Send</button>
        </form>
      </Card>
    </Page>
  );
};

/** Memory: everything the assistant has kept about you, with a way to delete it. */
export const MemoryView = ({ person }) => {
  const [items, setItems] = useState([]);
  const load = () => api.memory().then((data) => setItems(data.items));
  useEffect(() => { load(); }, [person.id]);
  const remove = async (id) => { await api.forget(id); load(); };
  const group = (kind, title, note) => {
    const list = items.filter((item) => item.kind === kind);
    return (
      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title} <span className="font-normal normal-case text-slate-400">· {list.length}</span></h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">{note}</p>
        {list.length === 0 && <p className="text-sm text-slate-400">Nothing yet.</p>}
        <ul className="divide-y divide-slate-100" data-kind={kind}>
          {list.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-2.5">
              <span className="flex-1 text-[15px] text-slate-700">{item.text}<span className="ml-2 text-xs text-slate-400">{day(item.created)}</span></span>
              <button type="button" aria-label="Forget this" onClick={() => remove(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      </Card>
    );
  };
  return (
    <Page
      title="Memory"
      subtitle="What the assistant remembers about you. Only you can see it, and you can delete any of it."
      actions={items.length > 0 && <button id="forget-all" type="button" onClick={() => remove()} className="flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"><Trash2 size={15} /> Forget everything</button>}
    >
      <div className="grid grid-cols-2 gap-5">
        {group('fact', 'Facts about you', 'Things you told the assistant about yourself.')}
        {group('chat', 'Earlier conversations', 'One line per question you asked, so it can pick up where you left off.')}
      </div>
    </Page>
  );
};
