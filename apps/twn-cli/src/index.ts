import { Command } from 'commander';
import { handleInit } from './commands/init.command';
import { handleValidate } from './commands/validate.command';
import { handleStatus } from './commands/status.command';
import { handleAudit } from './commands/audit.command';

const program = new Command();

program
  .name('twn')
  .description('Atlas Engineering Operating System CLI — Governance, Blueprint & Drift Management')
  .version('0.1.0');

program
  .command('init [project-name]')
  .description('Initialize a new Atlas governed workspace in the current directory')
  .option('-d, --domain <domain>', 'Domain or industry sector (e.g. developer-tools, fintech)')
  .option('-a, --agent <agent>', 'Install agent skill adapter (cursor, claude, codex)')
  .option('-p, --project-path <path>', 'Override target working directory')
  .action((projectName, options) => {
    handleInit(projectName, options);
  });

program
  .command('validate')
  .description('Validate the workspace .atlas/blueprint.yaml against schema and check drift')
  .option('--drift-check', 'Run AST physical path drift check against declared components')
  .option('-p, --project-path <path>', 'Override target working directory')
  .action((options) => {
    handleValidate(options);
  });

program
  .command('audit')
  .description('Run complete Engineering Score audit and drift report')
  .option('--json', 'Output report in raw JSON format')
  .option('-p, --project-path <path>', 'Override target working directory')
  .action((options) => {
    handleAudit(options);
  });

program
  .command('status')
  .description('Display Atlas workspace status and component health')
  .option('-p, --project-path <path>', 'Override target working directory')
  .action((options) => {
    handleStatus(options.projectPath);
  });

program.parse(process.argv);

