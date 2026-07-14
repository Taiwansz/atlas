import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getErrorMessage, isRecord } from '../../lib/api-utils';

interface IWorkspaceModule {
  name: string;
  type: 'ingress' | 'logic';
  dependencies: string[];
  purpose: string;
  allowedEgress: string[];
}

function readPackageMetadata(packageJsonPath: string): {
  name?: string;
  description?: string;
} {
  const parsed = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as unknown;

  if (!isRecord(parsed)) {
    return {};
  }

  return {
    name: typeof parsed.name === 'string' ? parsed.name : undefined,
    description: typeof parsed.description === 'string' ? parsed.description : undefined,
  };
}

function scanModules(workspaceRoot: string, directory: 'packages' | 'apps'): IWorkspaceModule[] {
  const modulesDirectory = path.join(workspaceRoot, directory);
  if (!fs.existsSync(modulesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(modulesDirectory)
    .filter((folder) => fs.statSync(path.join(modulesDirectory, folder)).isDirectory())
    .map((folder) => {
      const packageJsonPath = path.join(modulesDirectory, folder, 'package.json');
      const defaultPurpose =
        directory === 'packages' ? 'Core library module' : 'Application service module';
      const metadata = fs.existsSync(packageJsonPath) ? readPackageMetadata(packageJsonPath) : {};

      return {
        name: directory === 'packages' ? `@atlas/${folder}` : folder,
        type: directory === 'packages' ? 'ingress' : 'logic',
        dependencies: [],
        purpose: metadata.description ?? defaultPurpose,
        allowedEgress: [],
      };
    });
}

export function GET() {
  try {
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const rootPackageJsonPath = path.join(workspaceRoot, 'package.json');
    const isLocal = fs.existsSync(rootPackageJsonPath);

    if (!isLocal) {
      return NextResponse.json({
        isLocal: false,
        projectName: 'atlas-monorepo',
        stack: 'nextjs-fastify',
        description: 'AI-Powered software development OS (Cloud Staging Mode)',
        modules: [],
      });
    }

    const rootMetadata = readPackageMetadata(rootPackageJsonPath);
    const modules = [
      ...scanModules(workspaceRoot, 'packages'),
      ...scanModules(workspaceRoot, 'apps'),
    ];

    return NextResponse.json({
      isLocal: true,
      projectName: rootMetadata.name ?? 'atlas-workspace',
      stack: 'nextjs-fastify',
      description: rootMetadata.description ?? 'Real local workspace scanning',
      modules,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
