import { app } from 'electron';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(execFile);

export const AdminService = {
  /**
   * Checks if the current process has administrator privileges.
   */
  async isAdmin(): Promise<boolean> {
    try {
      // On Windows, 'net session' only works if running as admin
      await execAsync('net', ['session']);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Restarts the application with administrator privileges.
   * Note: In dev mode, this may behave differently than in production.
   */
  async restartAsAdmin(): Promise<{ success: boolean; error?: string }> {
    try {
      const exePath = process.execPath;
      
      // We use PowerShell Start-Process with -Verb RunAs to trigger the UAC prompt
      // We escape the path to handle spaces in the executable path
      const command = `Start-Process -FilePath '${exePath}' -Verb RunAs`;
      
      await execAsync('powershell', ['-NoProfile', '-NonInteractive', '-Command', command]);
      
      // After requesting elevation, we quit the current non-admin instance
      app.quit();
      
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[AdminService] Restart as admin failed:', message);
      return { success: false, error: message };
    }
  }
};
