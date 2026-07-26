import { DeviceAuthService } from '@atlas/auth';

export function handleLogout() {
  const auth = new DeviceAuthService();
  const res = auth.logout();

  if (res) {
    console.log(`\n👋 Successfully logged out of Atlas SaaS. Local credentials removed.\n`);
  } else {
    console.log(`\n⚠️  No active Atlas login session found.\n`);
  }
}
