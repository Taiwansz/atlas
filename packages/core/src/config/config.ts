import { z } from 'zod';
import * as dotenv from 'dotenv';
import { ConfigurationException } from '../errors/errors';

// Load environmental variables
dotenv.config();

export const ConfigSchema = z.object({
  env: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  port: z.coerce.number().default(8080),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  workspacePath: z.string().default(process.cwd()),
  database: z.object({
    url: z.string().default('postgresql://postgres:postgres@localhost:5432/atlas'),
    maxConnections: z.coerce.number().default(20),
  }),
  ai: z.object({
    primaryProvider: z.enum(['gemini', 'anthropic', 'openai', 'local']).default('anthropic'),
    primaryModel: z.string().default('claude-3-5-sonnet'),
    geminiApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
    openaiApiKey: z.string().optional(),
    localApiEndpoint: z.string().default('http://localhost:11434'),
  }),
  eventBus: z.object({
    provider: z.enum(['in-memory', 'kafka', 'sqs']).default('in-memory'),
    kafkaBrokers: z.array(z.string()).default(['localhost:9092']),
  }),
});

export type IConfig = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private static configInstance: IConfig | null = null;

  public static load(): IConfig {
    if (this.configInstance) {
      return this.configInstance;
    }

    const rawData = {
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      logLevel: process.env.LOG_LEVEL,
      workspacePath: process.env.ATLAS_WORKSPACE_PATH,
      database: {
        url: process.env.DATABASE_URL,
        maxConnections: process.env.DATABASE_MAX_CONNECTIONS,
      },
      ai: {
        primaryProvider: process.env.ATLAS_AI_PROVIDER,
        primaryModel: process.env.ATLAS_AI_MODEL,
        geminiApiKey: process.env.GEMINI_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
        localApiEndpoint: process.env.LOCAL_API_ENDPOINT,
      },
      eventBus: {
        provider: process.env.ATLAS_EVENT_BUS_PROVIDER,
        kafkaBrokers: process.env.KAFKA_BROKERS?.split(','),
      },
    };

    const result = ConfigSchema.safeParse(rawData);

    if (!result.success) {
      const errorDetails = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new ConfigurationException(`Invalid environment configuration: ${errorDetails}`);
    }

    this.configInstance = result.data;
    return this.configInstance;
  }

  public static clear(): void {
    this.configInstance = null;
  }
}
