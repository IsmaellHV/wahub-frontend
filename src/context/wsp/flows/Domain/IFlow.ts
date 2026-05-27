import type { IAuditFields } from '@shared/Domain/ILogDocument';

// ---------------------------------------------------------------
// Triggers
// ---------------------------------------------------------------
export type FlowTriggerKeywordMatch = 'exact' | 'contains' | 'starts_with';

export interface FlowTriggerKeyword {
  type: 'keyword';
  value: string;
  match: FlowTriggerKeywordMatch;
  case_sensitive?: boolean;
}

export interface FlowTriggerCatchall {
  type: 'catchall';
}

export interface FlowTriggerSchedule {
  type: 'schedule';
  cron: string;
}

export type FlowTrigger = FlowTriggerKeyword | FlowTriggerCatchall | FlowTriggerSchedule;

// ---------------------------------------------------------------
// Steps
// ---------------------------------------------------------------
export interface FlowStepSendMessage {
  type: 'send_message';
  body: string;
}

export interface FlowStepWait {
  type: 'wait';
  seconds: number;
}

export interface FlowStepAiReply {
  type: 'ai_reply';
  agent_id: number;
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
