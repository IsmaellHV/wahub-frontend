import type { IAuditFields } from '@shared/Domain/ILogDocument';

// `position` es opcional y solo lo usa el canvas (react-flow). Se guarda
// transparente en el JSON; el backend / engine lo ignora.
export interface CanvasPosition {
  x: number;
  y: number;
}

// ---------------------------------------------------------------
// Triggers
// ---------------------------------------------------------------
export type FlowTriggerKeywordMatch = 'exact' | 'contains' | 'starts_with';

export interface FlowTriggerKeyword {
  type: 'keyword';
  value: string;
  match: FlowTriggerKeywordMatch;
  case_sensitive?: boolean;
  position?: CanvasPosition;
}

export interface FlowTriggerCatchall {
  type: 'catchall';
  position?: CanvasPosition;
}

export interface FlowTriggerSchedule {
  type: 'schedule';
  cron: string;
  position?: CanvasPosition;
}

export type FlowTrigger = FlowTriggerKeyword | FlowTriggerCatchall | FlowTriggerSchedule;

// ---------------------------------------------------------------
// Steps
// ---------------------------------------------------------------
export interface FlowStepSendMessage {
  type: 'send_message';
  body: string;
  position?: CanvasPosition;
}

export interface FlowStepWait {
  type: 'wait';
  seconds: number;
  position?: CanvasPosition;
}

export interface FlowStepAiReply {
  type: 'ai_reply';
  agent_id: number;
  position?: CanvasPosition;
}

export type FlowStep = FlowStepSendMessage | FlowStepWait | FlowStepAiReply;

// ---------------------------------------------------------------
// Entity (front-side, normalizado)
// ---------------------------------------------------------------
export interface IFlow extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  triggers: FlowTrigger[];
  steps: FlowStep[];
}

export interface ISaveFlowInput {
  name: string;
  description?: string | null;
  enabled?: boolean;
  triggers: FlowTrigger[];
  steps: FlowStep[];
}
