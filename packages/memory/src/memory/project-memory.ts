import fs from 'fs';
import path from 'path';

export interface MemoryRecord {
  id: string;
  category: 'DECISION' | 'FEATURE' | 'CONSTITUTION' | 'BUG_FIX';
  title: string;
  content: string;
  timestamp: string;
}

export class ProjectMemoryService {
  private memoryDir: string;

  constructor(projectPath?: string) {
    const root = projectPath || process.cwd();
    this.memoryDir = path.join(root, '.atlas', 'memory');
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  public recordEvent(record: Omit<MemoryRecord, 'id' | 'timestamp'>): MemoryRecord {
    const id = `MEM-${Date.now()}`;
    const fullRecord: MemoryRecord = {
      ...record,
      id,
      timestamp: new Date().toISOString()
    };

    const filePath = path.join(this.memoryDir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullRecord, null, 2), 'utf-8');
    return fullRecord;
  }

  public getHistory(): MemoryRecord[] {
    if (!fs.existsSync(this.memoryDir)) return [];
    const files = fs.readdirSync(this.memoryDir).filter((f) => f.endsWith('.json'));

    return files.map((file) => {
      const content = fs.readFileSync(path.join(this.memoryDir, file), 'utf-8');
      return JSON.parse(content) as MemoryRecord;
    });
  }
}
