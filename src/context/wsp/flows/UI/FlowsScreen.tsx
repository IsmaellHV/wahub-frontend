'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@shared/UI/components/Topbar';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { RepositoryFlowImpl } from '../Infrastructure/RepositoryImpl';
import { RepositoryAiAgentImpl } from '@wsp/agents/Infrastructure/RepositoryImpl';
import type { IAiAgent } from '@wsp/agents/Domain/IAiAgent';
import type { IFlow, ISaveFlowInput, FlowTrigger, FlowStep } from '../Domain/IFlow';
import { FlowCanvas } from './canvas/FlowCanvas';

const repo = new RepositoryFlowImpl();
const agentRepo = new RepositoryAiAgentImpl();

const blankFlow = (): ISaveFlowInput => ({
  name: '',
  description: '',
  enabled: true,
  triggers: [{ type: 'keyword', value: '', match: 'contains', case_sensitive: false, position: { x: 80, y: 80 } }],
  steps: [{ type: 'send_message', body: 'Hola {{contact.number}} 👋', position: { x: 360, y: 80 } }],
});

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
            <div className="sub">Automatiza respuestas: arma flujos visuales con triggers y steps.</div>
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
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Sin flujos todavia</div>
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
// Editor modal (canvas)
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
  const canSave = value.name.trim().length > 0 && value.triggers.length > 0 && value.steps.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 'none', width: '98vw', height: '94vh', display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Header */}
        <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>{isEdit ? 'Editar flujo' : 'Nuevo flujo'}</h3>
            <input
              className="input"
              value={value.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="Nombre del flujo (ej. Bienvenida)"
              style={{ flex: 1, maxWidth: 360 }}
            />
            <input
              className="input"
              value={value.description ?? ''}
              onChange={e => setField('description', e.target.value)}
              placeholder="Descripcion (opcional)"
              style={{ flex: 1, maxWidth: 320 }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={!!value.enabled} onChange={e => setField('enabled', e.target.checked)} />
              Activo
            </label>
          </div>
          <button className="icon-btn" onClick={onClose} title="Cerrar">
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <FlowCanvas value={value} agents={agents} onChange={onChange} />
        </div>

        {/* Footer */}
        <div className="card-h" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
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
