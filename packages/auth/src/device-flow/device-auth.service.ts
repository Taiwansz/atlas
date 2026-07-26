import fs from 'fs';
import os from 'os';
import path from 'path';

export interface DeviceCodeSession {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
}

export interface AuthCredentials {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  };
  accessToken: string;
  expiresAt: string;
}

export class DeviceAuthService {
  private credentialsPath: string;

  constructor() {
    const atlasHome = path.join(os.homedir(), '.atlas');
    if (!fs.existsSync(atlasHome)) {
      fs.mkdirSync(atlasHome, { recursive: true });
    }
    this.credentialsPath = path.join(atlasHome, 'credentials.json');
  }

  /**
   * Initiates Device Authorization Flow
   */
  public async initiateDeviceFlow(): Promise<DeviceCodeSession> {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const userCode = `TWN-${randomCode}`;
    const deviceCode = `DEV-CODE-${Date.now()}`;

    return {
      deviceCode,
      userCode,
      verificationUri: 'https://atlas-app.dev/device',
      expiresIn: 300
    };
  }

  /**
   * Saves credentials after successful login
   */
  public saveCredentials(creds: AuthCredentials): void {
    fs.writeFileSync(this.credentialsPath, JSON.stringify(creds, null, 2), 'utf-8');
  }

  /**
   * Gets current logged in credentials
   */
  public getCredentials(): AuthCredentials | null {
    if (!fs.existsSync(this.credentialsPath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(this.credentialsPath, 'utf-8');
      return JSON.parse(content) as AuthCredentials;
    } catch {
      return null;
    }
  }

  /**
   * Clears saved credentials (logout)
   */
  public logout(): boolean {
    if (fs.existsSync(this.credentialsPath)) {
      fs.unlinkSync(this.credentialsPath);
      return true;
    }
    return false;
  }
}
