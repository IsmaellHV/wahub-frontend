'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@shared/UI/components/Topbar';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { RepositoryFlowImpl } from '../Infrastructure/RepositoryImpl';
import { RepositoryAiAgentImpl } from '@wsp/agents/Infrastructure/RepositoryImpl';
import type { IAiAgent } from '@wsp/agents/Domain/IAiAgent';
import type { IFlow, ISaveFlowInput, FlowTrigger, FlowStep, FlowTriggerKeywordMatch } from '../Domain/IFlow';

const repo = new RepositoryFlowImpl();
const agentRepo = new RepositoryAiAgentImpl();

const blankFlow = (): ISaveFlowInput => ({
  name: '',
  description: '',
  enabled: true,
  triggers: [{ type: 'keyword', value: '', match: 'contains', case_sensitive: false }],
  steps: [{ type: 'send_message', body: 'Hola {{contact.number}} 👋' }],
});

const MATCH_OPTIONS: Array<{ v: FlowTriggerKeywordMatch; l: string }> = [
  { v: 'contains', l: 'Contiene' },
  { v: 'exact', l: 'Exacto' },
  { v: 'starts_with', l: 'Empieza con' },
];

const triggerLabel = (t: FlowTrigger): string => {
  if (t.type === 'keyword') return `"${t.value || '…'}" (${t.match})`;
  if (t.type === 'catchall') return 'cualquier mensaje';
  return `cron: ${t.cron}`;
};

const stepLabel = (s: FlowStep): string => {
  if (s.type === 'send_message') return `mensaje: ${s.body.slice(0, 28)}${s.body.length > 28 ? '…' : ''}`;
  if (s.type === 'wait') return `esperar ${s.seconds}s`;
  return `IA · agente ${s.agent_id}`;
};

export const FlowsScreen = () => {
  const { t } = useI18n();
  const [flows, setFlows] = useState<IFlow[]>([]);
  const [agents, setAgents] = useState<IAiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id?: number; input: ISaveFlowInput } | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [f, a] = await Promise.all([repo.list(), agentRepo.list()]);
      setFlows(f);
      setAgents(a);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Error cargando');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const startNew = (): void => setEditing({ input: blankFlow() });
  const startEdit = (f: IFlow): void =>
    setEditing({
      id: f.id,
      input: {
        name: f.name,
        description: f.description ?? '',
        enabled: f.enabled,
        triggers: f.triggers,
        steps: f.steps,
      },
    });

  const save = async (): Promise<void> => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      if (editing.id) await repo.update(editing.id, editing.input);
      else await repo.create(editing.input);
      setEditing(null);
      await reload();
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Error guardando');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (f: IFlow): Promise<void> => {
    try {
      await repo.toggle(f.id, !f.enabled);
      setFlows(curr => curr.map(x => (x.id === f.id ? { ...x, enabled: !f.enabled } : x)));
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Error');
    }
  };

  const remove = async (f: IFlow): Promise<void> => {
    if (!confirm(`¿Eliminar flujo "${f.name}"?`)) return;
    try {
      await repo.remove(f.id);
      setFlows(curr => curr.filter(x => x.id !== f.id));
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Error eliminando');
    }
  };

  return (
    <>
      <Topbar crumbs={[t('nav.flows')]} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>{t('nav.flows')}</h1>
            <div className="sub">Automatiza respuestas: define disparadores (palabras clave, schedule) y pasos secuenciales.</div>
          </div>
          <div className="actions">
            <button className="btn btn-brand" onClick={startNew}>
              <Icon name="plus" size={14} /> Nuevo flujo
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              color: 'var(--status-error)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>{t('common.loading')}</div>
        ) : flows.length === 0 && !editing ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div className="empty-icon">
              <Icon name="flow" size={20} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Sin flujos todavía</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6, marginBottom: 16 }}>
              Crea tu primer flujo para automatizar respuestas en WhatsApp.
            </div>
            <button className="btn btn-brand" onClick={startNew}>
              <Icon name="plus" size={14} /> Crear primer flujo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {flows.map(f => (
              <div key={f.id} className="card">
                <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</h3>
                    {f.description && (
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 2 }}>
                        {f.description}
                      </div>
                    )}
                  </div>
                  <span className={`pill pill-${f.enabled ? 'online' : 'idle'}`}>
                    <span className={`dot dot-${f.enabled ? 'online pulse' : 'idle'}`} />
                    {f.enabled ? 'activo' : 'pausado'}
                  </span>
                </div>
                <div className="card-body">
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                    <div>
                      <span style={{ color: 'var(--fg-faint)' }}>Triggers:</span>{' '}
                      {f.triggers.map(triggerLabel).join(' · ') || '—'}
                    </div>
                    <div>
                      <span style={{ color: 'var(--fg-faint)' }}>Steps:</span>{' '}
                      {f.steps.map(stepLabel).join(' → ') || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(f)}>
                      <Icon name="edit" size={12} /> Editar
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => void toggle(f)}>
                      <Icon name={f.enabled ? 'pause' : 'play'} size={12} /> {f.enabled ? 'Pausar' : 'Activar'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => void remove(f)} style={{ color: 'var(--status-error)', marginLeft: 'auto' }}>
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <FlowEditorModal
            value={editing.input}
            isEdit={editing.id !== undefined}
            agents={agents}
            saving={saving}
            onChange={input => setEditing({ ...editing, input })}
            onSave={save}
            onClose={() => !saving && setEditing(null)}
          />
        )}
      </div>
    </>
  );
};

// ============================================================
// Editor modal
// ============================================================

interface EditorProps {
  value: ISaveFlowInput;
  isEdit: boolean;
  agents: IAiAgent[];
  saving: boolean;
  onChange: (v: ISaveFlowInput) => void;
  onSave: () => void | Promise<void>;
  onClose: () => void;
}

const FlowEditorModal = ({ value, isEdit, agents, saving, onChange, onSave, onClose }: EditorProps) => {
  const setField = <K extends keyof ISaveFlowInput>(k: K, v: ISaveFlowInput[K]): void => onChange({ ...value, [k]: v });

  const addTrigger = (type: FlowTrigger['type']): void => {
    const t: FlowTrigger =
      type === 'keyword'
        ? { type: 'keyword', value: '', match: 'contains', case_sensitive: false }
        : type === 'catchall'
          ? { type: 'catchall' }
          : { type: 'schedule', cron: '0 9 * * *' };
    setField('triggers', [...value.triggers, t]);
  };
  const removeTrigger = (i: number): void => setField('triggers', value.triggers.filter((_, idx) => idx !== i));
  const updateTrigger = (i: number, t: FlowTrigger): void => setField('triggers', value.triggers.map((x, idx) => (idx === i ? t : x)));

  const addStep = (type: FlowStep['type']): void => {
    const s: FlowStep =
      type === 'send_message'
        ? { type: 'send_message', body: '' }
        : type === 'wait'
          ? { type: 'wait', seconds: 5 }
          : { type: 'ai_reply', agent_id: agents[0]?.id ?? 0 };
    setField('steps', [...value.steps, s]);
  };
  const removeStep = (i: number): void => setField('steps', value.steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, s: FlowStep): void => setField('steps', value.steps.map((x, idx) => (idx === i ? s : x)));

  const canSave = value.name.trim().length > 0 && value.triggers.length > 0 && value.steps.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{isEdit ? 'Editar flujo' : 'Nuevo flujo'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          <Field label="Nombre">
            <input className="input" value={value.name} onChange={e => setField('name', e.target.value)} placeholder="Bienvenida + cotizacion" />
          </Field>

          <Field label="Descripcion (opcional)">
            <input className="input" value={value.description ?? ''} onChange={e => setField('description', e.target.value)} placeholder="Para que sirve este flujo" />
          </Field>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-muted)' }}>
            <input type="checkbox" checked={!!value.enabled} onChange={e => setField('enabled', e.target.checked)} />
            Flujo activo
          </label>

          {/* Triggers */}
          <Section title="Triggers" hint="Cuando dispara este flujo">
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addTrigger('keyword')}>+ keyword</button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addTrigger('catchall')}>+ catchall</button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addTrigger('schedule')}>+ schedule</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {value.triggers.map((t, i) => (
                <TriggerRow key={i} value={t} onChange={v => updateTrigger(i, v)} onRemove={() => removeTrigger(i)} />
              ))}
              {value.triggers.length === 0 && <EmptyHint text="Agrega al menos un trigger" />}
            </div>
          </Section>

          {/* Steps */}
          <Section title="Steps" hint="Que hace el flujo (en orden)">
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addStep('send_message')}>+ mensaje</button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addStep('wait')}>+ esperar</button>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => addStep('ai_reply')}
                disabled={agents.length === 0}
                title={agents.length === 0 ? 'Crea un agente IA primero' : ''}
              >
                + IA
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {value.steps.map((s, i) => (
                <StepRow key={i} value={s} agents={agents} index={i} onChange={v => updateStep(i, v)} onRemove={() => removeStep(i)} />
              ))}
              {value.steps.length === 0 && <EmptyHint text="Agrega al menos un step" />}
            </div>
          </Section>
        </div>

        <div className="card-h" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-brand" onClick={() => void onSave()} disabled={saving || !canSave}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear flujo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Helpers UI
// ============================================================

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550 }}>{label}</label>
    {children}
  </div>
);

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 2 }}>{hint}</div>}
    </div>
    {children}
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <div style={{ fontSize: 12, color: 'var(--fg-faint)', fontStyle: 'italic', padding: '6px 2px' }}>{text}</div>
);

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 10,
  borderRadius: 'var(--r-md)',
  background: 'var(--bg-elev)',
  border: '1px solid var(--border)',
};

// ============================================================
// Trigger row
// ============================================================
const TriggerRow = ({ value, onChange, onRemove }: { value: FlowTrigger; onChange: (v: FlowTrigger) => void; onRemove: () => void }) => (
  <div style={rowStyle}>
    <select
      className="input"
      style={{ maxWidth: 130 }}
      value={value.type}
      onChange={e => {
        const t = e.target.value as FlowTrigger['type'];
        if (t === 'keyword') onChange({ type: 'keyword', value: '', match: 'contains', case_sensitive: false });
        else if (t === 'catchall') onChange({ type: 'catchall' });
        else onChange({ type: 'schedule', cron: '0 9 * * *' });
      }}
    >
      <option value="keyword">keyword</option>
      <option value="catchall">catchall</option>
      <option value="schedule">schedule</option>
    </select>

    {value.type === 'keyword' && (
      <>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="palabra clave"
          value={value.value}
          onChange={e => onChange({ ...value, value: e.target.value })}
        />
        <select
          className="input"
          style={{ maxWidth: 140 }}
          value={value.match}
          onChange={e => onChange({ ...value, match: e.target.value as FlowTriggerKeywordMatch })}
        >
          {MATCH_OPTIONS.map(o => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-muted)' }}
          title="Sensible a mayusculas"
        >
          <input type="checkbox" checked={!!value.case_sensitive} onChange={e => onChange({ ...value, case_sensitive: e.target.checked })} />
          aA
        </label>
      </>
    )}

    {value.type === 'schedule' && (
      <input
        className="input mono"
        style={{ flex: 1 }}
        placeholder="0 9 * * *"
        value={value.cron}
        onChange={e => onChange({ type: 'schedule', cron: e.target.value })}
      />
    )}

    {value.type === 'catchall' && (
      <span style={{ flex: 1, fontSize: 12, color: 'var(--fg-faint)' }}>fallback: cualquier mensaje sin keyword</span>
    )}

    <button className="btn btn-ghost btn-sm" onClick={onRemove} style={{ color: 'var(--status-error)' }}>
      <Icon name="trash" size={12} />
    </button>
  </div>
);

// ============================================================
// Step row
// ============================================================
const StepRow = ({
  value,
  agents,
  index,
  onChange,
  onRemove,
}: {
  value: FlowStep;
  agents: IAiAgent[];
  index: number;
  onChange: (v: FlowStep) => void;
  onRemove: () => void;
}) => (
  <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'stretch' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--fg-faint)', width: 18, textAlign: 'center' }}>{index + 1}.</span>
      <select
        className="input"
        style={{ maxWidth: 170 }}
        value={value.type}
        onChange={e => {
          const t = e.target.value as FlowStep['type'];
          if (t === 'send_message') onChange({ type: 'send_message', body: '' });
          else if (t === 'wait') onChange({ type: 'wait', seconds: 5 });
          else onChange({ type: 'ai_reply', agent_id: agents[0]?.id ?? 0 });
        }}
      >
        <option value="send_message">enviar mensaje</option>
        <option value="wait">esperar</option>
        <option value="ai_reply">respuesta IA</option>
      </select>

      {value.type === 'wait' && (
        <>
          <input
            type="number"
            min={0}
            max={3600}
            className="input"
            style={{ maxWidth: 100 }}
            value={value.seconds}
            onChange={e => onChange({ type: 'wait', seconds: Number(e.target.value) || 0 })}
          />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>segundos</span>
        </>
      )}

      {value.type === 'ai_reply' && (
        <select
          className="input"
          style={{ flex: 1 }}
          value={value.agent_id}
          onChange={e => onChange({ type: 'ai_reply', agent_id: Number(e.target.value) })}
        >
          {agents.length === 0 && <option value={0}>(sin agentes — crea uno primero)</option>}
          {agents.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.provider}/{a.model}
            </option>
          ))}
        </select>
      )}

      <button className="btn btn-ghost btn-sm" onClick={onRemove} style={{ color: 'var(--status-error)', marginLeft: 'auto' }}>
        <Icon name="trash" size={12} />
      </button>
    </div>

    {value.type === 'send_message' && (
      <textarea
        className="input"
        rows={3}
        placeholder="Cuerpo del mensaje. Variables disponibles: {{contact.number}}, {{message.body}}"
        value={value.body}
        onChange={e => onChange({ type: 'send_message', body: e.target.value })}
      />
    )}
  </div>
);
