import type { Node, Edge } from '@xyflow/react';
import type { ISaveFlowInput, FlowTrigger, FlowStep, CanvasPosition } from '../../Domain/IFlow';

// ---------------------------------------------------------------
// Convierte entre representacion plana (ISaveFlowInput) y graph (react-flow).
// Order de steps = posicion Y ascendente. Sin edges manuales en MVP.
// ---------------------------------------------------------------

export type FlowNodeKind = 'trigger' | 'step';

export interface FlowNodeData extends Record<string, unknown> {
  kind: FlowNodeKind;
  payload: FlowTrigger | FlowStep;
}

// Layout vertical: triggers arriba, steps abajo en columna centrada.
const DEFAULT_X = 200;
const DEFAULT_Y_TRIGGER = 60;
const Y_GAP = 120;

const triggerNodeId = (i: number): string => `trigger-${i}`;
const stepNodeId = (i: number): string => `step-${i}`;

/** Genera nodos react-flow desde la lista plana de triggers/steps. */
export function flowToNodes(input: ISaveFlowInput): Node<FlowNodeData>[] {
  const nodes: Node<FlowNodeData>[] = [];

  const triggerCount = input.triggers.length;
  input.triggers.forEach((t, i) => {
    nodes.push({
      id: triggerNodeId(i),
      type: 'triggerNode',
      position: t.position ?? { x: DEFAULT_X, y: DEFAULT_Y_TRIGGER + i * Y_GAP },
      data: { kind: 'trigger', payload: t },
    });
  });

  input.steps.forEach((s, i) => {
    nodes.push({
      id: stepNodeId(i),
      type: 'stepNode',
      position: s.position ?? { x: DEFAULT_X, y: DEFAULT_Y_TRIGGER + (triggerCount + i) * Y_GAP },
      data: { kind: 'step', payload: s },
    });
  });

  return nodes;
}

/** Edges visuales derivadas del orden Y. Trigger(s) → primer step, despues step→step en cadena. */
export function deriveEdges(nodes: Node<FlowNodeData>[]): Edge[] {
  const triggerNodes = nodes.filter(n => n.data.kind === 'trigger');
  const stepNodes = nodes
    .filter(n => n.data.kind === 'step')
    .slice()
    .sort((a, b) => a.position.y - b.position.y);

  const edges: Edge[] = [];
  if (stepNodes.length === 0) return edges;

  // Conecta cada trigger al primer step. Smoothstep = right-angle, mas legible
  // que bezier curvo cuando los nodos estan alineados verticalmente.
  const first = stepNodes[0];
  for (const t of triggerNodes) {
    edges.push({
      id: `${t.id}->${first.id}`,
      source: t.id,
      target: first.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'var(--brand-500)', strokeWidth: 2 },
    });
  }

  // Cadena step→step en orden de Y.
  for (let i = 0; i < stepNodes.length - 1; i++) {
    const a = stepNodes[i];
    const b = stepNodes[i + 1];
    edges.push({
      id: `${a.id}->${b.id}`,
      source: a.id,
      target: b.id,
      type: 'smoothstep',
      style: { stroke: 'color-mix(in srgb, var(--brand-500) 60%, var(--border))', strokeWidth: 2 },
    });
  }

  return edges;
}

/** Convierte nodos del canvas de vuelta a la forma plana esperada por el backend. */
export function nodesToFlow(nodes: Node<FlowNodeData>[]): { triggers: FlowTrigger[]; steps: FlowStep[] } {
  const triggers: FlowTrigger[] = [];
  const steps: Array<{ payload: FlowStep; y: number }> = [];

  for (const n of nodes) {
    const pos: CanvasPosition = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
    if (n.data.kind === 'trigger') {
      triggers.push({ ...(n.data.payload as FlowTrigger), position: pos });
    } else {
      steps.push({ payload: { ...(n.data.payload as FlowStep), position: pos }, y: n.position.y });
    }
  }

  // Orden steps por Y ascendente (top → bottom).
  steps.sort((a, b) => a.y - b.y);

  return { triggers, steps: steps.map(s => s.payload) };
}

/** Crea un nodo de trigger nuevo en una posicion dada. */
export function newTriggerNode(type: FlowTrigger['type'], position: CanvasPosition, existingCount: number): Node<FlowNodeData> {
  const payload: FlowTrigger =
    type === 'keyword'
      ? { type: 'keyword', value: '', match: 'contains', case_sensitive: false }
      : type === 'catchall'
        ? { type: 'catchall' }
        : { type: 'schedule', cron: '0 9 * * *' };
  return {
    id: triggerNodeId(existingCount),
    type: 'triggerNode',
    position,
    data: { kind: 'trigger', payload },
  };
}

/** Crea un nodo de step nuevo en una posicion dada. */
export function newStepNode(type: FlowStep['type'], position: CanvasPosition, existingCount: number, defaultAgentId = 0): Node<FlowNodeData> {
  const payload: FlowStep =
    type === 'send_message'
      ? { type: 'send_message', body: '' }
      : type === 'wait'
        ? { type: 'wait', seconds: 5 }
        : { type: 'ai_reply', agent_id: defaultAgentId };
  return {
    id: stepNodeId(existingCount),
    type: 'stepNode',
    position,
    data: { kind: 'step', payload },
  };
}
