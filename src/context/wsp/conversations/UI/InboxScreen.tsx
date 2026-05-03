'use client';
import { useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';
import { MOCK_CONVS, MOCK_MESSAGES } from '../Infrastructure/mockConvs';

type InboxTab = 'all' | 'unread' | 'human' | 'ai';

const TABS: Array<{ id: InboxTab; l: string; n: number }> = [
  { id: 'all', l: 'All', n: 247 },
  { id: 'unread', l: 'Unread', n: 12 },
  { id: 'human', l: 'Needs me', n: 3 },
  { id: 'ai', l: 'AI', n: 232 },
];

export const InboxScreen = () => {
  const [active, setActive] = useState(MOCK_CONVS[0]);
  const [tab, setTab] = useState<InboxTab>('all');
  const [aiOn, setAiOn] = useState(true);
  const [draft, setDraft] = useState('');

  return (
    <>
      <Topbar
        crumbs={['Inbox', 'All conversations']}
        actions={
          <button className="btn btn-secondary btn-sm">
            <Icon name="filter" size={13} /> Filter
          </button>
        }
      />
      <div className="inbox">
        {/* List */}
        <div className="inbox-list">
          <div className="inbox-search">
            <div style={{ position: 'relative' }}>
              <input className="input" placeholder="Search conversations..." style={{ paddingLeft: 30 }} />
              <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--fg-faint)' }} />
            </div>
          </div>
          <div className="inbox-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`inbox-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.l}
                <span className="count">{t.n}</span>
              </button>
            ))}
          </div>
          <div className="conv-list">
            {MOCK_CONVS.map((c) => (
              <div key={c.id} className={`conv ${active.id === c.id ? 'active' : ''}`} onClick={() => setActive(c)}>
                <div className="avatar">{c.init}</div>
                <div className="conv-body">
                  <div className="conv-name">
                    {c.name}
                    {c.ai && (
                      <span style={{ color: 'var(--brand-500)', display: 'inline-flex' }}>
                        <Icon name="sparkles" size={11} />
                      </span>
                    )}
                  </div>
                  <div className="conv-msg">{c.last}</div>
                  {c.tags.length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.tags.map((t) => (
                        <span key={t} className="tag" style={{ padding: '0 6px', fontSize: 10.5 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="conv-time">{c.time}</span>
                  {c.unread > 0 && <span className="unread">{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="thread">
          <div className="thread-header">
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
              {active.init}
            </div>
            <div>
              <div className="name">{active.name}</div>
              <div className="num">{active.num} · last seen 2m ago</div>
            </div>
            <div className="actions">
              <div className="ai-toggle">
                <span style={{ color: aiOn ? 'var(--brand-500)' : 'var(--fg-faint)' }}>
                  <Icon name="sparkles" size={13} />
                </span>
                <span className="muted" style={{ fontSize: 12.5 }}>
                  AI {aiOn ? 'replying' : 'paused'}
                </span>
                <div className={`switch ${aiOn ? 'on' : ''}`} onClick={() => setAiOn(!aiOn)} />
              </div>
              <button className="icon-btn">
                <Icon name="user" size={15} />
              </button>
              <button className="icon-btn">
                <Icon name="more" size={15} />
              </button>
            </div>
          </div>

          <div className="messages">
            <div className="msg-day">Today</div>
            {MOCK_MESSAGES.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                <div>{m.text}</div>
                <div className="meta">
                  {m.ai && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="sparkles" size={9} /> AI
                    </span>
                  )}
                  {m.who && <span>{m.who}</span>}
                  <span>{m.time}</span>
                  {m.from !== 'in' && <Icon name="check" size={10} stroke={2.5} />}
                </div>
              </div>
            ))}
          </div>

          <div className="composer">
            {aiOn && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: 'color-mix(in srgb, var(--brand-500) 6%, transparent)',
                  border: '1px dashed color-mix(in srgb, var(--brand-500) 30%, transparent)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 12,
                  color: 'var(--brand-500)',
                }}
              >
                <Icon name="sparkles" size={13} />
                <span style={{ color: 'var(--fg-muted)' }}>AI is replying automatically. Type to take over.</span>
              </div>
            )}
            <div className="composer-bar">
              <button className="icon-btn">
                <Icon name="paperclip" size={16} />
              </button>
              <button className="icon-btn">
                <Icon name="template" size={16} />
              </button>
              <textarea
                placeholder="Type a message... or press / for templates"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
              />
              <button className="icon-btn">
                <Icon name="smile" size={16} />
              </button>
              <button className="btn btn-brand btn-sm" disabled={!draft.trim()}>
                <Icon name="send" size={13} /> Send
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="contact-panel">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingBottom: 16,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 18, marginBottom: 10 }}>
              {active.init}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{active.name}</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 2 }}>
              {active.num}
            </div>
          </div>

          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h4>Contact</h4>
            <div className="contact-row">
              <span>Bot</span>
              <span className="v">Lunaría Boutique</span>
            </div>
            <div className="contact-row">
              <span>First contact</span>
              <span className="v">Apr 28</span>
            </div>
            <div className="contact-row">
              <span>Conversations</span>
              <span className="v">7</span>
            </div>
            <div className="contact-row">
              <span>Lifetime value</span>
              <span className="v">$3,420 MXN</span>
            </div>
          </div>

          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h4>Tags</h4>
            <div style={{ marginTop: 4 }}>
              {active.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
              <span className="tag" style={{ cursor: 'pointer', color: 'var(--fg-faint)' }}>
                + add
              </span>
            </div>
          </div>

          <div style={{ padding: '16px 0' }}>
            <h4>AI summary</h4>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--fg-muted)',
                lineHeight: 1.55,
                padding: '10px 12px',
                background: 'color-mix(in srgb, var(--brand-500) 5%, var(--bg-subtle))',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--brand-500)',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Icon name="sparkles" size={11} /> Generated
              </div>
              Customer requested Sierra leather boots in black, size 25. Pair has been reserved for in-store pickup tomorrow at 10am at the Polanco location. No payment needed yet.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
