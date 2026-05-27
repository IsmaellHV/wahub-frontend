'use client';
import { Icon } from '@shared/UI/components/Icon';
import type { IAiAgent } from '@wsp/agents/Domain/IAiAgent';
import type { FlowTrigger, FlowStep, FlowTriggerKeywordMatch } from '../../Domain/IFlow';
import type { FlowNodeData } from './flowConverter';

// ---------------------------------------------------------------
// Panel derecho: edita payload del nodo seleccionado.
// ---------------------------------------------------------------

interface Props {
  selected: { id: string; data: FlowNodeData } | null;
  agents: IAiAgent[];
  onPayloadChange: (id: string, payload: FlowTrigger | FlowStep) => void;
  onDelete: (id: string) => void;
}

const MATCH_OPTIONS: Array<{ v: FlowTriggerKeywordMatch; l: string }> = [
  { v: 'contains', l: 'Contiene' },
  { v: 'exact', l: 'Exacto' },
  { v: 'starts_with', l: 'Empieza con' },
];

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550 };

export const NodeInspector = ({ selected, agents, onPayloadChange, onDelete }: Props) => {
  if (!selected) {
    return (
      <div style={{ padding: 24, color: 'var(--fg-faint)', fontSize: 12.5, lineHeight: 1.6 }}>
        <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--fg-muted)', fontWeight: 600 }}>Sin seleccion</div>
        Click un nodo en el canvas para editarlo, o arrastra uno desde la barra de la izquierda.
      </div>
    );
  }

  const setPayload = (patch: Partial<FlowTrigger> | Partial<FlowStep>): void => {
    onPayloadChange(selected.id, { ...selected.data.payload, ...patch } as FlowTrigger | FlowStep);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {selected.data.kind === 'trigger' ? 'Trigger' : 'Step'}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(selected.id)} style={{ color: 'var(--status-error)' }}>
          <Icon name="trash" size={12} /> Eliminar
        </button>
      </div>

      {selected.data.kind === 'trigger' && <TriggerInspector payload={selected.data.payload as FlowTrigger} onChange={setPayload} />}
      {selected.data.kind === 'step' && <StepInspector payload={selected.data.payload as FlowStep} agents={agents} onChange={setPayload} />}
    </div>
  );
};

// ============================================================
// Trigger inspector
// ============================================================
const TriggerInspector = ({ payload, onChange }: { payload: FlowTrigger; onChange: (p: Partial<FlowTrigger>) => void }) => {
  // Cambiar el `type` requiere reemplazar la forma completa.
  const setType = (type: FlowTrigger['type']): void => {
    if (type === payload.type) return;
    if (type === 'keyword') onChange({ type: 'keyword', value: '', match: 'contains', case_sensitive: false } as Partial<FlowTrigger>);
    else if (type === 'catchall') onChange({ type: 'catchall' } as Partial<FlowTrigger>);
    else onChange({ type: 'schedule', cron: '0 9 * * *' } as Partial<FlowTrigger>);
  };

  return (
    <>
      <div style={fieldStyle}>
        <label style={labelStyle}>Tipo</label>
        <select className="input" value={payload.type} onChange={e => setType(e.target.value as FlowTrigger['type'])}>
          <option value="keyword">keyword</option>
          <option value="catchall">catchall</option>
          <option value="schedule">schedule</option>
        </select>
      </div>

      {payload.type === 'keyword' && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Palabra clave</label>
            <input className="input" value={payload.value} onChange={e => onChange({ value: e.target.value } as Partial<FlowTrigger>)} placeholder="precio" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Modo de match</label>
            <select className="input" value={payload.match} onChange={e => onChange({ match: e.target.value as FlowTriggerKeywordMatch } as Partial<FlowTrigger>)}>
              {MATCH_OPTIONS.map(o => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
            <input
              type="checkbox"
              checked={!!payload.case_sensitive}
              onChange={e => onChange({ case_sensitive: e.target.checked } as Partial<FlowTrigger>)}
            />
            Sensible a mayusculas (aA)
          </label>
        </>
      )}

      {payload.type === 'schedule' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Cron</label>
          <input
            className="input mono"
            value={payload.cron}
            onChange={e => onChange({ cron: e.target.value } as Partial<FlowTrigger>)}
            placeholder="0 9 * * *"
          />
          <div style={{ fontSize: 11, color: 'var(--fg-faint)' }}>min hora dia mes diaSemana — ej. <code>0 9 * * 1-5</code> (9am L-V)</div>
        </div>
      )}

      {payload.type === 'catchall' && (
        <div style={{ fontSize: 12, color: 'var(--fg-faint)', lineHeight: 1.5 }}>
          Dispara cuando llega un mensaje que ningun otro flow con keyword captura. Util para mensaje de bienvenida o fallback.
        </div>
      )}
    </>
  );
};

// ============================================================
// Step inspector
// ============================================================
const StepInspector = ({ payload, agents, onChange }: { payload: FlowStep; agents: IAiAgent[]; onChange: (p: Partial<FlowStep>) => void }) => {
  const setType = (type: FlowStep['type']): void => {
    if (type === payload.type) return;
    if (type === 'send_message') onChange({ type: 'send_message', body: '' } as Partial<FlowStep>);
    else if (type === 'wait') onChange({ type: 'wait', seconds: 5 } as Partial<FlowStep>);
    else onChange({ type: 'ai_reply', agent_id: agents[0]?.id ?? 0 } as Partial<FlowStep>);
  };

  return (
    <>
      <div style={fieldStyle}>
        <label style={labelStyle}>Tipo</label>
        <select className="input" value={payload.type} onChange={e => setType(e.target.value as FlowStep['type'])}>
          <option value="send_message">enviar mensaje</option>
          <option value="wait">esperar</option>
          <option value="ai_reply">respuesta IA</option>
        </select>
      </div>

      {payload.type === 'send_message' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Cuerpo</label>
          <textarea
            className="input"
            rows={5}
            placeholder="Hola {{contact.number}} 👋"
            value={payload.body}
            onChange={e => onChange({ body: e.target.value } as Partial<FlowStep>)}
          />
          <div style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
            Variables: <code>{`{{contact.number}}`}</code>, <code>{`{{message.body}}`}</code>
          </div>
        </div>
      )}

      {payload.type === 'wait' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Segundos</label>
          <input
            type="number"
            min={0}
            max={3600}
            className="input"
            value={payload.seconds}
            onChange={e => onChange({ seconds: Number(e.target.value) || 0 } as Partial<FlowStep>)}
          />
        </div>
      )}

      {payload.type === 'ai_reply' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Agente IA</label>
          <select
            className="input"
            value={payload.agent_id}
            onChange={e => onChange({ agent_id: Number(e.target.value) } as Partial<FlowStep>)}
          >
            {agents.length === 0 && <option value={0}>(sin agentes — crea uno primero)</option>}
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} · {a.provider}/{a.model}</option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};
