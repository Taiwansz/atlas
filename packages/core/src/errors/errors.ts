export class AtlasException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string = 'ATLAS_INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, new TargetConcreteError(this.constructor));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Utility to handle inheritance in TS error classes
class TargetConcreteError {
  constructor(target: any) {
    return target.prototype;
  }
}

export class ConfigurationException extends AtlasException {
  constructor(message: string) {
    super(message, 'ATLAS_CONFIGURATION_ERROR');
  }
}

export class ConstitutionViolationException extends AtlasException {
  public readonly invariantId: string;

  constructor(message: string, invariantId: string) {
    super(`Constitution violation detected on invariant [${invariantId}]: ${message}`, 'ATLAS_CONSTITUTION_VIOLATION');
    this.invariantId = invariantId;
  }
}

export class DataDriftException extends AtlasException {
  public readonly componentId: string;
  public readonly fieldName: string;

  constructor(message: string, componentId: string, fieldName: string) {
    super(`Drift detected in component [${componentId}] at field [${fieldName}]: ${message}`, 'ATLAS_DATA_DRIFT');
    this.componentId = componentId;
    this.fieldName = fieldName;
  }
}

export class AIProviderException extends AtlasException {
  public readonly provider: string;
  public readonly statusCode?: number | undefined;

  constructor(message: string, provider: string, statusCode?: number) {
    super(`AI Provider [${provider}] error: ${message}`, 'ATLAS_AI_PROVIDER_ERROR');
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class EventBusException extends AtlasException {
  constructor(message: string) {
    super(`Event Bus failure: ${message}`, 'ATLAS_EVENT_BUS_ERROR');
  }
}
