'use client';
import { useEffect, useMemo, useState } from 'react';
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
  if (t.type === 'keyword') return `palabra: "${t.value}" (${t.match})`;
  if (t.type === 'catchall') return 'cualquier mensaje';
  return `schedule: ${t.cron}`;
};

const stepLabel = (s: FlowStep): string => {
  if (s.type === 'send_message') return `enviar mensaje (${s.body.slice(0, 32)}${s.body.length > 32 ? '…' : ''})`;
  if (s.type === 'wait') return `esperar ${s.seconds}s`;
  return `respuesta IA (agente ${s.agent_id})`;
};

export const FlowsScreen = () => {
  const { t } = useI18n();
  const [flows, setFlows] = useState<IFlow[]>([]);
  const [agents, setAgents] = useState<IAiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id?: number; input: ISaveFlowInput } | null>(null);
  const [saving, setSaving] = useState(false);

  void t;

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
  const cancel = (): void => setEditing(null);

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
    if (!confirm(`Eliminar flujo "${f.name}"?`)) return;
    try {
      await repo.remove(f.id);
      setFlows(curr => curr.filter(x => x.id !== f.id));
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Error eliminando');
    }
  };

  const counts = useMemo(() => ({ total: flows.length, enabled: flows.filter(f => f.enabled).length }), [flows]);

  return (
    <>
      <Topbar
        crumbs={['Flujos']}
        actions={
          <button className="btn btn-primary btn-sm" onClick={startNew}>
            <Icon name="plus" size={14} /> Nuevo flujo
          </button>
        }
      />

      <div className="p-6 space-y-4 max-w-5xl">
        <div className="text-sm opacity-70">
          {loading ? 'Cargando…' : `${counts.total} flujos · ${counts.enabled} activos`}
        </div>

        {error && <div className="card p-3 text-red-400 text-sm">{error}</div>}

        {!loading && flows.length === 0 && !editing && (
          <div className="card p-8 text-center opacity-70">
            <p className="text-sm mb-3">Aun no tienes flujos. Crea el primero para automatizar respuestas.</p>
            <button className="btn btn-primary btn-sm" onClick={startNew}>
              <Icon name="plus" size={14} /> Crear flujo
            </button>
          </div>
        )}

        <div className="space-y-3">
          {flows.map(f => (
            <div key={f.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{f.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${f.enabled ? 'bg-green-500/15 text-green-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                      {f.enabled ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  {f.description && <p className="text-xs opacity-60 mt-1">{f.description}</p>}
                  <div className="mt-2 text-xs space-y-0.5 opacity-70">
                    <div>Triggers: {f.triggers.map(triggerLabel).join(' · ') || '—'}</div>
                    <div>Steps: {f.steps.map(stepLabel).join(' → ') || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="btn btn-ghost btn-xs" onClick={() => void toggle(f)} title={f.enabled ? 'Pausar' : 'Activar'}>
                    <Icon name={f.enabled ? 'pause' : 'play'} size={13} />
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(f)} title="Editar">
                    <Icon name="edit" size={13} />
                  </button>
                  <button className="btn btn-ghost btn-xs text-red-400" onClick={() => void remove(f)} title="Eliminar">
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <FlowEditor
            value={editing.input}
            agents={agents}
            saving={saving}
            onChange={input => setEditing({ ...editing, input })}
            onSave={save}
            onCancel={cancel}
          />
        )}
      </div>
    </>
  );
};

// ============================================================
// Editor inline
// ============================================================

interface EditorProps {
  value: ISaveFlowInput;
  agents: IAiAgent[];
  saving: boolean;
  onChange: (v: ISaveFlowInput) => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
}

const FlowEditor = ({ value, agents, saving, onChange, onSave, onCancel }: EditorProps) => {
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

  return (
    <div className="card p-5 space-y-5 border-2 border-brand-500/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{value.name ? 'Editar flujo' : 'Nuevo flujo'}</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!value.enabled} onChange={e => setField('enabled', e.target.checked)} />
          Activo
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs opacity-70 mb-1">Nombre</label>
          <input className="input w-full" value={value.name} onChange={e => setField('name', e.target.value)} placeholder="Bienvenida + cotizacion" />
        </div>
        <div>
          <label className="block text-xs opacity-70 mb-1">Descripcion (opcional)</label>
          <input className="input w-full" value={value.description ?? ''} onChange={e => setField('description', e.target.value)} />
        </div>
      </div>

      {/* Triggers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Triggers</h4>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => addTrigger('keyword')}>+ keyword</button>
            <button className="btn btn-ghost btn-xs" onClick={() => addTrigger('catchall')}>+ catchall</button>
            <button className="btn btn-ghost btn-xs" onClick={() => addTrigger('schedule')}>+ schedule</button>
          </div>
        </div>
        <div className="space-y-2">
          {value.triggers.map((t, i) => (
            <TriggerRow key={i} value={t} onChange={v => updateTrigger(i, v)} onRemove={() => removeTrigger(i)} />
          ))}
          {value.triggers.length === 0 && <p className="text-xs opacity-60">Agrega al menos un trigger.</p>}
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Steps</h4>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => addStep('send_message')}>+ mensaje</button>
            <button className="btn btn-ghost btn-xs" onClick={() => addStep('wait')}>+ esperar</button>
            <button className="btn btn-ghost btn-xs" onClick={() => addStep('ai_reply')} disabled={agents.length === 0} title={agents.length === 0 ? 'Crea un agente IA primero' : ''}>
              + IA
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {value.steps.map((s, i) => (
            <StepRow key={i} value={s} agents={agents} index={i} onChange={v => updateStep(i, v)} onRemove={() => removeStep(i)} />
          ))}
          {value.steps.length === 0 && <p className="text-xs opacity-60">Agrega al menos un step.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => void onSave()}
          disabled={saving || !value.name.trim() || value.triggers.length === 0 || value.steps.length === 0}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Trigger row
// ============================================================
const TriggerRow = ({ value, onChange, onRemove }: { value: FlowTrigger; onChange: (v: FlowTrigger) => void; onRemove: () => void }) => (
  <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/40">
    <select
      className="input input-sm"
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
        <input className="input input-sm flex-1" placeholder="palabra clave" value={value.value} onChange={e => onChange({ ...value, value: e.target.value })} />
        <select className="input input-sm" value={value.match} onChange={e => onChange({ ...value, match: e.target.value as FlowTriggerKeywordMatch })}>
          {MATCH_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <label className="text-xs opacity-70 flex items-center gap-1">
          <input type="checkbox" checked={!!value.case_sensitive} onChange={e => onChange({ ...value, case_sensitive: e.target.checked })} />
          aA
        </label>
      </>
    )}

    {value.type === 'schedule' && (
      <input className="input input-sm flex-1 font-mono" placeholder="cron: 0 9 * * *" value={value.cron} onChange={e => onChange({ type: 'schedule', cron: e.target.value })} />
    )}

    {value.type === 'catchall' && <span className="text-xs opacity-60 flex-1">cualquier mensaje (fallback)</span>}

    <button className="btn btn-ghost btn-xs text-red-400" onClick={onRemove}><Icon name="trash" size={12} /></button>
  </div>
);

// ============================================================
// Step row
// ============================================================
const StepRow = ({ value, agents, index, onChange, onRemove }: { value: FlowStep; agents: IAiAgent[]; index: number; onChange: (v: FlowStep) => void; onRemove: () => void }) => (
  <div className="p-2 rounded bg-zinc-900/40 space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-50 w-6 text-center">{index + 1}.</span>
      <select
        className="input input-sm"
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
            className="input input-sm w-24"
            value={value.seconds}
            onChange={e => onChange({ type: 'wait', seconds: Number(e.target.value) || 0 })}
          />
          <span className="text-xs opacity-60">segundos</span>
        </>
      )}

      {value.type === 'ai_reply' && (
        <select
          className="input input-sm flex-1"
          value={value.agent_id}
          onChange={e => onChange({ type: 'ai_reply', agent_id: Number(e.target.value) })}
        >
          {agents.length === 0 && <option value={0}>(sin agentes — crea uno primero)</option>}
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name} · {a.provider}/{a.model}</option>
          ))}
        </select>
      )}

      <button className="btn btn-ghost btn-xs text-red-400 ml-auto" onClick={onRemove}><Icon name="trash" size={12} /></button>
    </div>

    {value.type === 'send_message' && (
      <textarea
        className="input w-full text-sm"
        rows={3}
        placeholder="Cuerpo del mensaje. Variables: {{contact.number}}, {{message.body}}"
        value={value.body}
        onChange={e => onChange({ type: 'send_message', body: e.target.value })}
      />
    )}
  </div>
);
