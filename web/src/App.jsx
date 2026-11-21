// The frame of the app: icon rail, search bar, the current view, and the Ask panel.
import { useEffect, useRef, useState } from 'react';
import { Landmark, Home, FileText, MessagesSquare, CalendarDays, MessageCircle, Brain, Search, Sparkles, ChevronDown } from 'lucide-react';
import { api, setUser } from './api.js';
import { Avatar, SpaceTag, TypeBadge } from './ui.jsx';
import { HomeView, SearchView, DocumentsView, DiscussionsView, EventsView, MessagesView, MemoryView } from './views.jsx';
import AskPanel from './AskPanel.jsx';

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'discussions', label: 'Discussions', icon: MessagesSquare },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'memory', label: 'Memory', icon: Brain },
];

// Which view shows each type of content.
const VIEW_OF = { document: 'documents', topic: 'discussions', reply: 'discussions', event: 'events', message: 'messages' };

/**
 * The search box with suggestions while typing.
 * @param {{ onSearch: (q: string) => void, onOpen: (item: object) => void, userId: string }} props
 */
const SearchBar = ({ onSearch, onOpen, userId }) => {
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (text.trim().length < 2) { setItems([]); return undefined; }
    let stale = false;
    const timer = setTimeout(() => {
      api.suggest(text).then((data) => { if (!stale) setItems(data.items); }).catch(() => {});
    }, 120);
    return () => { stale = true; clearTimeout(timer); };
  }, [text, userId]);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setOpen(false);
    onSearch(text.trim());
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-2xl">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        ref={input}
        id="search"
        value={text}
        onChange={(event) => { setText(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search documents, discussions, events and messages"
        autoComplete="off"
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-16 text-[15px] shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
      <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">⌘K</kbd>
      {open && items.length > 0 && (
        <ul id="suggestions" className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseDown={() => { setOpen(false); onOpen(item); }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-indigo-50"
              >
                <TypeBadge type={item.type} />
                <span className="truncate font-medium">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

/**
 * Lets you act as another person, which changes what search may return.
 * @param {{ people: object[], spaces: object[], person: object, onChange: (id: string) => void }} props
 */
const PersonSwitcher = ({ people, spaces, person, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button id="person" type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100">
        <Avatar name={person.name} />
        <span className="text-left leading-tight">
          <span className="block text-sm font-semibold">{person.name}</span>
          <span className="block text-xs text-slate-500">{person.role}</span>
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">View Plaza as</p>
          <div className="max-h-96 overflow-auto">
            {people.map((item) => (
              <button
                key={item.id}
                type="button"
                data-person={item.id}
                onClick={() => { setOpen(false); onChange(item.id); }}
                className={`flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50 ${item.id === person.id ? 'bg-indigo-50' : ''}`}
              >
                <Avatar name={item.name} />
                <span>
                  <span className="block text-sm font-semibold">{item.name} <span className="font-normal text-slate-500">· {item.role}</span></span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">{item.spaces.map((id) => <SpaceTag key={id} id={id} spaces={spaces} />)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [people, setPeople] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [userId, setUserId] = useState('ava');
  const [view, setView] = useState('home');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    api.people().then((data) => { setPeople(data.people); setSpaces(data.spaces); });
  }, []);

  const person = people.find((item) => item.id === userId);
  if (!person) return <div className="p-10 text-slate-500">Loading Plaza…</div>;
  const mySpaces = spaces.filter((space) => person.spaces.includes(space.id));

  const go = (next) => { setView(next); setSelected(null); };
  const open = (item) => { setSelected(item); setView(VIEW_OF[item.type]); };
  const switchPerson = (id) => { setUser(id); setUserId(id); setSelected(null); };
  const shared = { person, spaces: mySpaces, allSpaces: spaces, selected, open };
  const viewKey = `${view}-${userId}`;

  return (
    <div className="flex h-full">
      <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white py-4">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md"><Landmark size={22} /></div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-view={id}
            onClick={() => go(id)}
            className={`flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${view === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
          <div className="flex flex-1 justify-center">
            <SearchBar userId={userId} onSearch={(q) => { setQuery(q); go('search'); }} onOpen={open} />
          </div>
          <button
            id="ask-toggle"
            type="button"
            onClick={() => setAskOpen(!askOpen)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${askOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
          >
            <Sparkles size={16} /> Ask
          </button>
          <PersonSwitcher people={people} spaces={spaces} person={person} onChange={switchPerson} />
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          {view === 'home' && <HomeView key={viewKey} {...shared} go={go} />}
          {view === 'search' && <SearchView {...shared} key={`search-${userId}-${query}`} query={query} />}
          {view === 'documents' && <DocumentsView key={viewKey} {...shared} />}
          {view === 'discussions' && <DiscussionsView key={viewKey} {...shared} />}
          {view === 'events' && <EventsView key={viewKey} {...shared} />}
          {view === 'messages' && <MessagesView key={viewKey} {...shared} />}
          {view === 'memory' && <MemoryView key={viewKey} {...shared} />}
        </main>
      </div>

      {askOpen && <AskPanel key={userId} person={person} spaces={spaces} open={open} onClose={() => setAskOpen(false)} />}
    </div>
  );
}
