export interface IConversation {
  id: string;
  name: string;
  num: string;
  last: string;
  time: string;
  unread: number;
  ai: boolean;
  init: string;
  tags: string[];
}

export type MessageFrom = 'in' | 'out' | 'bot';

export interface IMessage {
  from: MessageFrom;
  text: string;
  time: string;
  ai?: boolean;
  who?: string;
}
