import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CollectorAPI, type CollectionLog, type IllegalDumpingReport, getWasteTypeColor, formatTimestamp } from '@/utils/api';
import { Scan, AlertTriangle, Clock, MapPin, Trash2, CheckCircle, XCircle, Timer } from 'lucide-react';

interface DashboardProps {
  collectorId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ collectorId }) => {
  const [recentLogs, setRecentLogs] = useState<CollectionLog[]>([]);
  const [recentReports, setRecentReports] = useState<IllegalDumpingReport[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    totalReports: 0,
    todayScans: 0,
    pendingReports: 0
  });

  useEffect(() => {
    loadData();
  }, [collectorId]);

  const loadData = async () => {
    try {
      const [logs, reports] = await Promise.all([
        CollectorAPI.getCollectionLogs(collectorId),
        CollectorAPI.getDumpingReports(collectorId)
      ]);

      // Sort by timestamp (most recent first)
      const sortedLogs = logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);

      const sortedReports = reports.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);

      setRecentLogs(sortedLogs);
      setRecentReports(sortedReports);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayScans = logs.filter(log => 
        new Date(log.timestamp) >= today
      ).length;

      const pendingReports = reports.filter(report => 
        report.status === 'Pending'
      ).length;

      setStats({
        totalScans: logs.length,
        totalReports: reports.length,
        todayScans,
        pendingReports
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Timer className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-success text-success-foreground';
      case 'Rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-warning text-warning-foreground';
    }
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Scans</p>
                  <p className="text-2xl font-bold text-primary">{stats.todayScans}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold text-success">{stats.totalScans}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-2xl font-bold text-secondary">{stats.totalReports}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingReports}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Timer className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Collection Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              Recent Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center waste-${log.waste_type.toLowerCase()}`}>
                        <Trash2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">User: {log.user_id}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      className={`${getWasteTypeColor(log.waste_type)} text-white`}
                    >
                      {log.waste_type}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scan className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No collections yet</p>
                <p className="text-sm">Start scanning QR codes to track collections</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Dumping Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span className="font-medium">Report #{report.id?.slice(-6)}</span>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(report.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reports yet</p>
                <p className="text-sm">Report illegal dumping to help keep areas clean</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;