'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Icon, type IconName } from '@shared/UI/components/Icon';
import type { FlowTrigger, FlowStep } from '../../Domain/IFlow';
import type { FlowNodeData } from './flowConverter';

// ---------------------------------------------------------------
// Node visuals: Trigger (verde) / Step (gris-azul). Selected = brand border.
// ---------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  borderRadius: 'var(--r-md)',
  padding: '10px 12px',
  minWidth: 220,
  maxWidth: 280,
  background: 'var(--bg-elev)',
  border: '1px solid var(--border)',
  fontSize: 12.5,
  fontFamily: 'inherit',
  color: 'var(--fg)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
};

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: 'var(--brand-500)',
  border: 'none',
};

const triggerIcon = (t: FlowTrigger): { icon: IconName; label: string; preview: string } => {
  if (t.type === 'keyword') return { icon: 'chat', label: 'Keyword', preview: `"${t.value || '…'}" · ${t.match}` };
  if (t.type === 'catchall') return { icon: 'layers', label: 'Catchall', preview: 'cualquier mensaje sin keyword' };
  return { icon: 'refresh', label: 'Schedule', preview: t.cron };
};

const stepIcon = (s: FlowStep): { icon: IconName; label: string; preview: string } => {
  if (s.type === 'send_message') return { icon: 'send', label: 'Enviar mensaje', preview: s.body || '(vacio)' };
  if (s.type === 'wait') return { icon: 'pause', label: 'Esperar', preview: `${s.seconds}s` };
  return { icon: 'sparkles', label: 'Respuesta IA', preview: `agente ${s.agent_id || '—'}` };
};

export const TriggerNode = ({ data, selected }: NodeProps & { data: FlowNodeData }) => {
  const t = data.payload as FlowTrigger;
  const meta = triggerIcon(t);
  return (
    <div
      style={{
        ...baseStyle,
        border: `1.5px solid ${selected ? 'var(--brand-500)' : 'color-mix(in srgb, var(--brand-500) 30%, var(--border))'}`,
        background: 'color-mix(in srgb, var(--brand-500) 8%, var(--bg-elev))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', padding: 6, borderRadius: 999, background: 'color-mix(in srgb, var(--brand-500) 20%, transparent)', color: 'var(--brand-500)' }}>
          <Icon name={meta.icon} size={12} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: 'var(--brand-500)' }}>{meta.label}</div>
          <div style={{ fontSize: 12, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.preview}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

export const StepNode = ({ data, selected }: NodeProps & { data: FlowNodeData }) => {
  const s = data.payload as FlowStep;
  const meta = stepIcon(s);
  return (
    <div
      style={{
        ...baseStyle,
        border: `1.5px solid ${selected ? 'var(--brand-500)' : 'var(--border)'}`,
      }}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', padding: 6, borderRadius: 999, background: 'var(--bg)', color: 'var(--fg-muted)' }}>
          <Icon name={meta.icon} size={12} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{meta.label}</div>
          <div style={{ fontSize: 12, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.preview}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

export const NODE_TYPES = {
  triggerNode: TriggerNode,
  stepNode: StepNode,
};
