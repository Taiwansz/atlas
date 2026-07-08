import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getFilePath = () => {
  return path.resolve(process.cwd(), '../../packages/core/src/db/raw-query.ts');
};

export async function GET() {
  try {
    const filePath = getFilePath();
    
    // Ensure parent directories exist
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // If file doesn't exist, seed it with the drifted code initial state
    if (!fs.existsSync(filePath)) {
      const initialDriftedCode = `import { pg } from '../lib/db';\n\n// Warning: Raw Database connection bypasses the repository pattern\nexport function executeRawQuery(sql: string) {\n  return pg.query(sql); // Unsanctioned bypass!\n}\n`;
      fs.writeFileSync(filePath, initialDriftedCode, 'utf8');
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const isDrifted = fileContent.includes('pg.query');

    return NextResponse.json({
      filePath: 'packages/core/src/db/raw-query.ts',
      driftStatus: isDrifted ? 'drift' : 'clean',
      contractCode: `// IUserRepository - Core Contract Invariant\nexport interface IUserRepository {\n  findById(id: string): Promise<User | null>;\n  save(user: User): Promise<void>;\n}`,
      physicalCode: fileContent,
      driftResolved: `import { supabase } from '../lib/supabase';\n\nexport class UserRepository implements IUserRepository {\n  async findById(id: string): Promise<User | null> {\n    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();\n    if (error || !data) return null;\n    return data as User;\n  }\n  async save(user: User): Promise<void> {\n    await supabase.from('users').upsert(user);\n  }\n}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const filePath = getFilePath();
    
    // Overwrite the file with the resolved clean version
    const cleanResolvedCode = `import { supabase } from '../lib/supabase';\n\nexport class UserRepository implements IUserRepository {\n  async findById(id: string): Promise<User | null> {\n    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();\n    if (error || !data) return null;\n    return data as User;\n  }\n  async save(user: User): Promise<void> {\n    await supabase.from('users').upsert(user);\n  }\n}\n`;
    
    fs.writeFileSync(filePath, cleanResolvedCode, 'utf8');
    
    return NextResponse.json({ success: true, message: 'Drift resolved in physical file.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
