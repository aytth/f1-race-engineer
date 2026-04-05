export type MessagePriority = 'critical' | 'high' | 'medium' | 'info';

export type MessageCategory =
  | 'tire_strategy'
  | 'pit_window'
  | 'gap_analysis'
  | 'weather'
  | 'race_control'
  | 'fuel_management'
  | 'risk_assessment'
  | 'position_change'
  | 'general';

export interface EngineerMessage {
  id: string;
  timestamp: string;
  lap: number;
  category: MessageCategory;
  priority: MessagePriority;
  message: string;
  reasoning?: string;
  driverNumber: number;
}

export interface EngineerStreamEvent {
  type: 'message' | 'status' | 'error';
  data: EngineerMessage | { status: string } | { error: string };
}
