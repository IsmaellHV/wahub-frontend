'use client';
import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  applyNodeChanges,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@shared/UI/components/Icon';
import type { IAiAgent } from '@wsp/agents/Domain/IAiAgent';
import type { ISaveFlowInput, FlowTrigger, FlowStep } from '../../Domain/IFlow';
import { NODE_TYPES } from './nodes';
import { NodeInspector } from './NodeInspector';
import { deriveEdges, flowToNodes, nodesToFlow, newStepNode, newTriggerNode, type FlowNodeData } from './flowConverter';

// ---------------------------------------------------------------
// Canvas drag-drop. Convierte ISaveFlowInput ↔ react-flow internamente
// y emite cambios planos via onChange para que el padre persista.
// ---------------------------------------------------------------

interface Props {
  value: ISaveFlowInput;
  agents: IAiAgent[];
  onChange: (next: ISaveFlowInput) => void;
}

const DRAG_TYPE = 'application/wahub-flow-node';

type PaletteItem = {
  kind: 'trigger' | 'step';
  subtype: FlowTrigger['type'] | FlowStep['type'];
  label: string;
  icon: 'chat' | 'layers' | 'refresh' | 'send' | 'pause' | 'sparkles';
  comingSoon?: boolean;
};

const PALETTE: PaletteItem[] = [
  { kind: 'trigger', subtype: 'keyword', label: 'Keyword', icon: 'chat' },
  { kind: 'trigger', subtype: 'catchall', label: 'Catchall', icon: 'layers' },
  { kind: 'trigger', subtype: 'schedule', label: 'Schedule', icon: 'refresh', comingSoon: true },
  { kind: 'step', subtype: 'send_message', label: 'Enviar mensaje', icon: 'send' },
  { kind: 'step', subtype: 'wait', label: 'Esperar', icon: 'pause' },
  { kind: 'step', subtype: 'ai_reply', label: 'Respuesta IA', icon: 'sparkles' },
];

export const FlowCanvas = ({ value, agents, onChange }: Props) => {
  // Re-deriva nodos cada vez que value cambia desde afuera (load inicial).
  // Internamente usamos local state para soportar drag suave.
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>(() => flowToNodes(value));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const edges = useMemo(() => deriveEdges(nodes), [nodes]);
  const selected = useMemo(() => {
    if (!selectedId) return null;
    const n = nodes.find(x => x.id === selectedId);
    return n ? { id: n.id, data: n.data } : null;
  }, [selectedId, nodes]);

  // Re-emite al padre con shape plano cada vez que nodos cambian.
  const emitFlat = useCallback(
    (next: Node<FlowNodeData>[]) => {
      const flat = nodesToFlow(next);
      onChange({ ...value, triggers: flat.triggers, steps: flat.steps });
    },
    [onChange, value],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(curr => {
        const next = applyNodeChanges(changes, curr) as Node<FlowNodeData>[];
        // Solo emit en cambios "estables" (position end / remove / dimensions). Drag intermedio se ignora.
        const stable = changes.some(c => c.type === 'position' && c.dragging === false) || changes.some(c => c.type === 'remove') || changes.some(c => c.type === 'dimensions');
        if (stable) emitFlat(next);
        return next;
      });
    },
    [emitFlat],
  );

  const onPayloadChange = useCallback(
    (id: string, payload: FlowTrigger | FlowStep) => {
      setNodes(curr => {
        const next = curr.map(n => (n.id === id ? { ...n, data: { ...n.data, payload } } : n));
        emitFlat(next);
        return next;
      });
    },
    [emitFlat],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes(curr => {
        const next = curr.filter(n => n.id !== id);
        emitFlat(next);
        return next;
      });
      if (selectedId === id) setSelectedId(null);
    },
    [emitFlat, selectedId],
  );

  // ---------- Drag from palette ----------
  const onDragStart = (e: React.DragEvent, item: PaletteItem): void => {
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_TYPE);
    if (!raw || !rfInstance) return;
    let item: PaletteItem;
    try {
      item = JSON.parse(raw);
    } catch {
      return;
    }
    const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes(curr => {
      const next =
        item.kind === 'trigger'
          ? [...curr, newTriggerNode(item.subtype as FlowTrigger['type'], position, curr.filter(n => n.data.kind === 'trigger').length)]
          : [...curr, newStepNode(item.subtype as FlowStep['type'], position, curr.filter(n => n.data.kind === 'step').length, agents[0]?.id ?? 0)];
      emitFlat(next);
      return next;
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 260px', height: '100%', minHeight: 460 }}>
      {/* Palette */}
      <div style={{ borderRight: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <PaletteSection title="Triggers">
          {PALETTE.filter(p => p.kind === 'trigger').map(p => (
            <PaletteItemView key={p.subtype} item={p} onDragStart={onDragStart} />
          ))}
        </PaletteSection>
        <PaletteSection title="Steps">
          {PALETTE.filter(p => p.kind === 'step').map(p => (
            <PaletteItemView key={p.subtype} item={p} onDragStart={onDragStart} />
          ))}
        </PaletteSection>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={() => {
            setNodes(curr => {
              const triggers = curr.filter(n => n.data.kind === 'trigger');
              const steps = curr.filter(n => n.data.kind === 'step').slice().sort((a, b) => a.position.y - b.position.y);
              const X = 200;
              const Y0 = 60;
              const GAP = 120;
              const next = [
                ...triggers.map((n, i) => ({ ...n, position: { x: X, y: Y0 + i * GAP } })),
                ...steps.map((n, i) => ({ ...n, position: { x: X, y: Y0 + (triggers.length + i) * GAP } })),
              ];
              emitFlat(next);
              return next;
            });
            // Re-fit view despues del relayout.
            setTimeout(() => rfInstance?.fitView({ padding: 0.25, maxZoom: 1.1 }), 50);
          }}
        >
          <Icon name="layers" size={12} /> Auto-organizar
        </button>
        <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--fg-faint)', lineHeight: 1.4 }}>
          Arrastra al canvas. El orden de los steps lo define su posicion vertical.
        </div>
      </div>

      {/* Canvas */}
      <div onDrop={onDrop} onDragOver={onDragOver} style={{ position: 'relative', background: 'var(--bg)', minHeight: 460 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          onInit={setRfInstance}
          fitView
          fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
          nodesDraggable
          nodesConnectable={false}
          edgesFocusable={false}
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="color-mix(in srgb, var(--border) 70%, transparent)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable maskColor="rgba(0,0,0,0.4)" style={{ background: 'var(--bg-elev)' }} />
        </ReactFlow>
      </div>

      {/* Inspector */}
      <div style={{ borderLeft: '1px solid var(--border)', overflowY: 'auto' }}>
        <NodeInspector selected={selected} agents={agents} onPayloadChange={onPayloadChange} onDelete={deleteNode} />
      </div>
    </div>
  );
};

// ============================================================
// Palette helpers
// ============================================================
const PaletteSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: 6 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  </div>
);

const PaletteItemView = ({ item, onDragStart }: { item: PaletteItem; onDragStart: (e: React.DragEvent, item: PaletteItem) => void }) => (
  <div
    draggable={!item.comingSoon}
    onDragStart={e => (item.comingSoon ? e.preventDefault() : onDragStart(e, item))}
    title={item.comingSoon ? 'Próximamente — el motor aún no ejecuta este trigger' : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 'var(--r-md)',
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)',
      fontSize: 12,
      cursor: item.comingSoon ? 'not-allowed' : 'grab',
      userSelect: 'none',
      opacity: item.comingSoon ? 0.45 : 1,
    }}
  >
    <span style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: item.kind === 'trigger' ? 'color-mix(in srgb, var(--brand-500) 20%, transparent)' : 'var(--bg)', color: item.kind === 'trigger' ? 'var(--brand-500)' : 'var(--fg-muted)' }}>
      <Icon name={item.icon} size={11} />
    </span>
    {item.label}
  </div>
);
