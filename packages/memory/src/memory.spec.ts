import { ProjectMemoryService } from './memory/project-memory';

describe('@atlas/memory ProjectMemoryService', () => {
  it('should record memory events and retrieve workspace history', () => {
    const memoryService = new ProjectMemoryService(process.cwd());
    const record = memoryService.recordEvent({
      category: 'DECISION',
      title: 'Monorepo Architecture Adopted',
      content: 'Using Nx and pnpm workspaces'
    });

    expect(record.id).toContain('MEM-');
    const history = memoryService.getHistory();
    expect(history.length).toBeGreaterThan(0);
  });
});
