// API utilities for SwachhSathi Collector App
// Ready for Supabase integration

export interface CollectionLog {
  id?: string;
  collector_id: string;
  user_id: string;
  waste_type: WasteType;
  timestamp: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface IllegalDumpingReport {
  id?: string;
  collector_id: string;
  photo_url?: string;
  photo_base64?: string; // For prototype without storage
  description?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'Verified' | 'Rejected';
}

export type WasteType = 'Dry' | 'Wet' | 'Recyclable' | 'Other';

export interface Collector {
  id: string;
  name: string;
  phone?: string;
  area?: string;
  is_active: boolean;
}

// Prototype storage (replace with Supabase calls)
class LocalStorage {
  private static getItem<T>(key: string): T[] {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  }

  private static setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getCollectionLogs(): CollectionLog[] {
    return this.getItem<CollectionLog>('collection_logs');
  }

  static addCollectionLog(log: Omit<CollectionLog, 'id'>): CollectionLog {
    const logs = this.getCollectionLogs();
    const newLog: CollectionLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    logs.push(newLog);
    this.setItem('collection_logs', logs);
    return newLog;
  }

  static getIllegalDumpingReports(): IllegalDumpingReport[] {
    return this.getItem<IllegalDumpingReport>('dumping_reports');
  }

  static addDumpingReport(report: Omit<IllegalDumpingReport, 'id'>): IllegalDumpingReport {
    const reports = this.getIllegalDumpingReports();
    const newReport: IllegalDumpingReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    reports.push(newReport);
    this.setItem('dumping_reports', reports);
    return newReport;
  }

  static getCurrentCollector(): Collector | null {
    const collectorData = localStorage.getItem('current_collector');
    return collectorData ? JSON.parse(collectorData) : null;
  }

  static setCurrentCollector(collector: Collector): void {
    localStorage.setItem('current_collector', JSON.stringify(collector));
  }

  static clearCurrentCollector(): void {
    localStorage.removeItem('current_collector');
  }
}

// API class (ready for Supabase integration)
export class CollectorAPI {
  // Authentication
  static async login(collectorId: string): Promise<Collector> {
    // Prototype: Create/retrieve collector
    const existing = LocalStorage.getCurrentCollector();
    if (existing && existing.id === collectorId) {
      return existing;
    }

    const collector: Collector = {
      id: collectorId,
      name: `Collector ${collectorId}`,
      is_active: true
    };

    LocalStorage.setCurrentCollector(collector);
    return collector;
  }

  static logout(): void {
    LocalStorage.clearCurrentCollector();
  }

  static getCurrentCollector(): Collector | null {
    return LocalStorage.getCurrentCollector();
  }

  // Collection logs
  static async logCollection(data: Omit<CollectionLog, 'id'>): Promise<CollectionLog> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase.from('collection_logs').insert([data]);
    return LocalStorage.addCollectionLog(data);
  }

  static async getCollectionLogs(collectorId?: string): Promise<CollectionLog[]> {
    // TODO: Replace with Supabase call
    const logs = LocalStorage.getCollectionLogs();
    return collectorId 
      ? logs.filter(log => log.collector_id === collectorId)
      : logs;
  }

  // Illegal dumping reports
  static async reportIllegalDumping(data: Omit<IllegalDumpingReport, 'id'>): Promise<IllegalDumpingReport> {
    // TODO: Replace with Supabase call + file upload
    return LocalStorage.addDumpingReport(data);
  }

  static async getDumpingReports(collectorId?: string): Promise<IllegalDumpingReport[]> {
    // TODO: Replace with Supabase call
    const reports = LocalStorage.getIllegalDumpingReports();
    return collectorId 
      ? reports.filter(report => report.collector_id === collectorId)
      : reports;
  }
}

// Utility functions
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getWasteTypeColor = (type: WasteType): string => {
  const colors = {
    'Dry': 'waste-dry',
    'Wet': 'waste-wet', 
    'Recyclable': 'waste-recyclable',
    'Other': 'waste-other'
  };
  return colors[type];
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};