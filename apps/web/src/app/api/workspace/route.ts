import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Determine the root of the workspace
    // We assume the Next.js server is running under apps/web, so root is 2 levels up
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    
    // Check if we are running in a local filesystem environment (like our Debian workspace)
    const isLocal = fs.existsSync(path.join(workspaceRoot, 'package.json'));
    
    if (!isLocal) {
      return NextResponse.json({
        isLocal: false,
        projectName: 'atlas-monorepo',
        stack: 'nextjs-fastify',
        description: 'AI-Powered software development OS (Cloud Staging Mode)',
        modules: []
      });
    }

    // Read projects by scanning packages and apps directories
    const modules: any[] = [];
    
    // 1. Scan packages
    const pkgsDir = path.join(workspaceRoot, 'packages');
    if (fs.existsSync(pkgsDir)) {
      const folders = fs.readdirSync(pkgsDir);
      for (const folder of folders) {
        const pkgPath = path.join(pkgsDir, folder);
        if (fs.statSync(pkgPath).isDirectory()) {
          const packageJsonPath = path.join(pkgPath, 'package.json');
          let purpose = 'Core library module';
          if (fs.existsSync(packageJsonPath)) {
            const pj = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            purpose = pj.description || purpose;
          }
          modules.push({
            name: `@atlas/${folder}`,
            type: 'ingress',
            dependencies: [],
            purpose,
            allowedEgress: []
          });
        }
      }
    }

    // 2. Scan apps
    const appsDir = path.join(workspaceRoot, 'apps');
    if (fs.existsSync(appsDir)) {
      const folders = fs.readdirSync(appsDir);
      for (const folder of folders) {
        const appPath = path.join(appsDir, folder);
        if (fs.statSync(appPath).isDirectory()) {
          const packageJsonPath = path.join(appPath, 'package.json');
          let purpose = 'Application service module';
          if (fs.existsSync(packageJsonPath)) {
            const pj = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            purpose = pj.description || purpose;
          }
          modules.push({
            name: folder,
            type: 'logic',
            dependencies: [],
            purpose,
            allowedEgress: []
          });
        }
      }
    }

    // Read project name from workspace package.json
    let projectName = 'atlas-workspace';
    let description = 'Real local workspace scanning';
    const rootPkgJsonPath = path.join(workspaceRoot, 'package.json');
    if (fs.existsSync(rootPkgJsonPath)) {
      const rpj = JSON.parse(fs.readFileSync(rootPkgJsonPath, 'utf8'));
      projectName = rpj.name || projectName;
      description = rpj.description || description;
    }

    return NextResponse.json({
      isLocal: true,
      projectName,
      stack: 'nextjs-fastify',
      description,
      modules
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
