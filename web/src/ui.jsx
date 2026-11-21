// Small shared pieces: type styles, date helpers, badges.
import { FileText, MessagesSquare, CalendarDays, MessageCircle, Reply } from 'lucide-react';

export const TYPES = {
  document: { label: 'Documents', one: 'Document', icon: FileText, tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  topic: { label: 'Discussions', one: 'Discussion', icon: MessagesSquare, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  reply: { label: 'Replies', one: 'Reply', icon: Reply, tone: 'bg-teal-50 text-teal-700 ring-teal-200' },
  event: { label: 'Events', one: 'Event', icon: CalendarDays, tone: 'bg-orange-50 text-orange-700 ring-orange-200' },
  message: { label: 'Messages', one: 'Message', icon: MessageCircle, tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const SPACE_DOT = {
  people: 'bg-slate-500', engineering: 'bg-indigo-500', sales: 'bg-emerald-500',
  support: 'bg-orange-500', operations: 'bg-teal-500', leadership: 'bg-rose-500',
};

export const day = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const longDay = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const time = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/**
 * Coloured label for a content type.
 * @param {{ type: string }} props
 */
export const TypeBadge = ({ type }) => {
  const { one, icon: Icon, tone } = TYPES[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tone}`}>
      <Icon size={12} /> {one}
    </span>
  );
};

/**
 * Space name with its colour dot.
 * @param {{ id: string, spaces: object[] }} props
 */
export const SpaceTag = ({ id, spaces }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
    <span className={`h-2 w-2 rounded-full ${SPACE_DOT[id] || 'bg-slate-400'}`} />
    {spaces.find((space) => space.id === id)?.name || id}
  </span>
);

/**
 * Round initials for a person.
 * @param {{ name: string, size?: string }} props
 */
export const Avatar = ({ name, size = 'h-8 w-8 text-xs' }) => (
  <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-white ${size}`}>
    {(name || '?').split(' ').map((part) => part[0]).join('').slice(0, 2)}
  </span>
);

export const Empty = ({ children }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{children}</div>
);
