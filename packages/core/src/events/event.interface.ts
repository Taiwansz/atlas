export interface IEventEnvelope {
  eventId: string;
  eventType: string; // e.g., "atlas.blueprint.approved"
  projectId: string;
  actorId: string; // human user ID or agent ID
  timestamp: number;
  schemaVersion: number;
  payload: Record<string, any>;
}

export interface IEventBus {
  publish(topic: string, event: IEventEnvelope): Promise<void>;
  subscribe(
    topic: string,
    handler: (event: IEventEnvelope) => Promise<void>
  ): Promise<void>;
}
