import { SocraticResearchEngine } from './socratic/socratic-engine';

describe('@atlas/research Socratic Engine', () => {
  it('should generate a valid proposed Atlas Blueprint from user intent', async () => {
    const engine = new SocraticResearchEngine();
    const blueprint = await engine.generateBlueprintProposal({
      projectName: 'fintech-payouts',
      domain: 'fintech',
      userPrompt: 'Implement Stripe multi-payout engine'
    });

    expect(blueprint.metadata.name).toBe('fintech-payouts');
    expect(blueprint.components.length).toBeGreaterThan(0);
  });
});
