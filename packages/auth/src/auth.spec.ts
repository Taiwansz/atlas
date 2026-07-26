import { DeviceAuthService } from './device-flow/device-auth.service';

describe('@atlas/auth DeviceAuthService', () => {
  it('should initiate device code flow with verification URI and code', async () => {
    const service = new DeviceAuthService();
    const session = await service.initiateDeviceFlow();

    expect(session.userCode).toContain('TWN-');
    expect(session.verificationUri).toBe('https://atlas-app.dev/device');
  });

  it('should save credentials and retrieve active user session', () => {
    const service = new DeviceAuthService();
    service.saveCredentials({
      user: {
        id: 'usr-123',
        email: 'taiwansz@atlas.dev',
        name: 'Taiwansz',
        organizationId: 'org-456',
        plan: 'PRO'
      },
      accessToken: 'jwt-token-sample',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    });

    const creds = service.getCredentials();
    expect(creds?.user.email).toBe('taiwansz@atlas.dev');
    expect(creds?.user.plan).toBe('PRO');

    service.logout();
    expect(service.getCredentials()).toBeNull();
  });
});
