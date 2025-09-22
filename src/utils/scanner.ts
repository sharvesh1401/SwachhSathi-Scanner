// QR Scanner utilities for SwachhSathi Collector App

export interface QRScanResult {
  text: string;
  userId?: string;
  isValid: boolean;
  error?: string;
}

export interface ScannerSettings {
  facingMode: 'user' | 'environment';
  aspectRatio: number;
  fps: number;
  qrbox: { width: number; height: number };
}

// Default scanner settings optimized for field use
export const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  facingMode: 'environment', // Back camera for scanning
  aspectRatio: 1.0, // Square aspect ratio
  fps: 10, // Balanced performance
  qrbox: { width: 250, height: 250 } // Scan area size
};

// Parse QR code data (SwachhSathi format)
export const parseQRCode = (qrText: string): QRScanResult => {
  try {
    // Expected format: "SWACHH_USER_{userId}" or JSON with user data
    if (qrText.startsWith('SWACHH_USER_')) {
      const userId = qrText.replace('SWACHH_USER_', '');
      if (userId && userId.length > 0) {
        return {
          text: qrText,
          userId: userId,
          isValid: true
        };
      }
    }

    // Try parsing as JSON (for more complex QR codes)
    try {
      const parsed = JSON.parse(qrText);
      if (parsed.userId || parsed.user_id) {
        return {
          text: qrText,
          userId: parsed.userId || parsed.user_id,
          isValid: true
        };
      }
    } catch {
      // Not JSON, continue with other formats
    }

    // Generic handling for other QR codes
    return {
      text: qrText,
      userId: qrText, // Use the full text as userId for prototype
      isValid: true
    };
  } catch (error) {
    return {
      text: qrText,
      isValid: false,
      error: 'Invalid QR code format'
    };
  }
};

// Validate user ID format
export const isValidUserId = (userId: string): boolean => {
  // Basic validation - adjust according to your user ID format
  return userId.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(userId);
};

// Generate mock QR codes for testing
export const generateMockQRCode = (userId: string): string => {
  return `SWACHH_USER_${userId}`;
};

// Scanner error handling
export const getScannerErrorMessage = (error: any): string => {
  if (error.name === 'NotAllowedError') {
    return 'Camera permission denied. Please allow camera access to scan QR codes.';
  }
  if (error.name === 'NotFoundError') {
    return 'No camera found on this device.';
  }
  if (error.name === 'NotSupportedError') {
    return 'Camera is not supported in this browser.';
  }
  if (error.name === 'NotReadableError') {
    return 'Camera is being used by another application.';
  }
  return 'An error occurred while accessing the camera. Please try again.';
};

// Scan history management (for offline functionality)
export interface ScanHistory {
  id: string;
  userId: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  synced: boolean;
}

export class ScanHistoryManager {
  private static STORAGE_KEY = 'scan_history';

  static addScan(userId: string, location?: { lat: number; lng: number }): ScanHistory {
    const scan: ScanHistory = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      location,
      synced: false
    };

    const history = this.getHistory();
    history.push(scan);
    this.saveHistory(history);
    
    return scan;
  }

  static getHistory(): ScanHistory[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getUnsyncedScans(): ScanHistory[] {
    return this.getHistory().filter(scan => !scan.synced);
  }

  static markAsSynced(scanId: string): void {
    const history = this.getHistory();
    const scan = history.find(s => s.id === scanId);
    if (scan) {
      scan.synced = true;
      this.saveHistory(history);
    }
  }

  static clearSyncedScans(): void {
    const history = this.getHistory().filter(scan => !scan.synced);
    this.saveHistory(history);
  }

  private static saveHistory(history: ScanHistory[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }
}