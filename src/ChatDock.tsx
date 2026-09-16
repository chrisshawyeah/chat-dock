import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ChatClient, ChatMessage, DockTab } from './types';
import { describe, useChatSession } from './useChatSession';

export interface ChatDockProps {
  /** The Mac door for this project; null when Settings has no door configured. */
  client: ChatClient | null;
  /** "Social Scraper", "Music" — used in the state line and the button. */
  projectLabel: string;
  /** Extra tabs beside "Chat" (the scraper adds "I'm talking to…"). */
  tabs?: DockTab[];
  onClose?: () => void;
  /** Shown when `client` is null: how to configure the door. */
  unconfigured?: ReactNode;
  pollMs?: number;
}

function hhmm(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toTimeString().slice(0, 5);
}

/** Read-only transcript, newest at the bottom, scrolled there. */
export function ChatTranscript({ messages, projectLabel }: { messages: ChatMessage[]; projectLabel: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [messages]);
  return (
    <div ref={box} className='cd-log' aria-live='polite'>
      {messages.length === 0 && <div className='cd-empty'>Nothing said yet in the {projectLabel} chat.</div>}
      {messages.map((m, i) => (
        <div key={`${m.ts}-${i}`} className={`cd-turn ${m.role}`}>
          <div className='cd-who'>{m.role === 'chris' ? 'Chris' : 'Claude'} {hhmm(m.ts)}</div>
          <div className='cd-text'>{m.text}</div>
        </div>
      ))}
    </div>
  );
}

/** The docked column: tab strip (Chat + extras), state line, one button, the transcript. */
export function ChatDock({ client, projectLabel, tabs = [], onClose, unconfigured, pollMs }: ChatDockProps) {
  const [tab, setTab] = useState('chat');
  const { session, messages, opening, error, reachable, open } = useChatSession(client, pollMs);
  const d = describe(session, projectLabel);
  const extra = tabs.find((t) => t.key === tab);

  return (
    <aside className='cd' aria-label={`${projectLabel} chat`}>
      <div className='cd-head' role='tablist'>
        <button type='button' role='tab' className='cd-tab' aria-selected={tab === 'chat'} onClick={() => setTab('chat')}>Chat</button>
        {tabs.map((t) => (
          <button key={t.key} type='button' role='tab' className='cd-tab' aria-selected={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
        {onClose && <button type='button' className='cd-close' onClick={onClose} aria-label='Close the chat column'>×</button>}
      </div>
      <div className='cd-body'>
        {extra ? extra.render() : (
          <>
            {!client ? (
              <div className='cd-empty'>{unconfigured ?? 'The chat door is not set up yet.'}</div>
            ) : reachable === false ? (
              <div className='cd-state'><span className='cd-dot' />The Mac is not reachable right now.</div>
            ) : (
              <>
                <div className='cd-state'><span className={`cd-dot ${session.state === 'open' ? 'on' : ''}`} />{d.line}</div>
                <div className='cd-actions'>
                  <button type='button' className='cd-btn' onClick={() => void open()} disabled={opening}>{opening ? 'Opening…' : d.action}</button>
                  {session.web_url && <a className='cd-link' href={session.web_url} target='_blank' rel='noopener noreferrer'>claude.ai ↗</a>}
                </div>
                {error && <div className='cd-err'>{error}</div>}
              </>
            )}
            <ChatTranscript messages={messages} projectLabel={projectLabel} />
            <div className='cd-foot'>Read-only · talk to it in the cmux tab</div>
          </>
        )}
      </div>
    </aside>
  );
}
