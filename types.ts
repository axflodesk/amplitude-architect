export interface AmplitudeEvent {
  id: string;
  action: string;
  view: string;
  click: string;
  eventName: string;
  eventProperties: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  imageData?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  REFINING = 'REFINING',
  ERROR = 'ERROR'
}

export interface DashboardStats {
  totalEvents: number;
  uniqueViews: number;
  uniqueActions: number;
}
