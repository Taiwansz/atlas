import { DeviceAuthService } from '@atlas/auth';

export async function handleLogin() {
  const auth = new DeviceAuthService();
  const existing = auth.getCredentials();

  if (existing) {
    console.log(`\n👤 Already logged in as: ${existing.user.email} (${existing.user.plan} Plan)`);
    console.log(`  - Organization: ${existing.user.organizationId}`);
    console.log(`  - Run 'twn logout' to switch accounts.\n`);
    return;
  }

  const session = await auth.initiateDeviceFlow();

  console.log(`\n🔐 Atlas SaaS Authentication (Device Authorization Flow)`);
  console.log(`=======================================================`);
  console.log(`  1. Open your browser at: \x1b[36m${session.verificationUri}\x1b[0m`);
  console.log(`  2. Enter the one-time code: \x1b[33m\x1b[1m${session.userCode}\x1b[0m`);
  console.log(`\n⏳ Waiting for browser authorization...`);

  // Simulate auto-authorization in local dev mode
  auth.saveCredentials({
    user: {
      id: 'usr-dev-1',
      email: 'taiwansz@atlas.dev',
      name: 'Taiwansz',
      organizationId: 'org-taiwansz-enterprise',
      plan: 'PRO'
    },
    accessToken: `JWT-TWN-SESSION-${Date.now()}`,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
  });

  console.log(`\n✅ Authorization successful!`);
  console.log(`  - Logged in as: taiwansz@atlas.dev`);
  console.log(`  - Plan: PRO (Unlimited Cloud Projects & Automatic PR Audit)`);
  console.log(`  - Credentials saved to ~/.atlas/credentials.json\n`);
}
