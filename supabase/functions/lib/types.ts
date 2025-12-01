export interface AmplitudeEvent {
  id: string;
  action: string;
  view: string;
  click: string;
  eventName: string;
  eventProperties: string;
}

export interface GenerateEventsRequest {
  description: string;
  imageBase64?: string;
}

export interface GenerateEventsResponse {
  events: AmplitudeEvent[];
}

export interface RefineEventsRequest {
  events: AmplitudeEvent[];
  instruction: string;
}

export interface RefineEventsResponse {
  events: AmplitudeEvent[];
  message: string;
}
