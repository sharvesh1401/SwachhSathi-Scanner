import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Dashboard from '@/components/Dashboard';
import QRScanner from '@/components/QRScanner';
import ReportDumping from '@/components/ReportDumping';
import { CollectorAPI, type WasteType } from '@/utils/api';
import { Scan, AlertTriangle, LogOut, User, Leaf } from 'lucide-react';

interface IndexProps {
  collectorId: string;
  onLogout: () => void;
}

const Index: React.FC<IndexProps> = ({ collectorId, onLogout }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'scanner' | 'report'>('dashboard');
  const [showWasteSelector, setShowWasteSelector] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [scanLocation, setScanLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleScanSuccess = (userId: string, location?: { lat: number; lng: number }) => {
    setScannedUserId(userId);
    setScanLocation(location || null);
    setActiveView('dashboard');
    setShowWasteSelector(true);
  };

  const handleWasteTypeSelect = async (wasteType: WasteType) => {
    if (!scannedUserId) return;

    try {
      await CollectorAPI.logCollection({
        collector_id: collectorId,
        user_id: scannedUserId,
        waste_type: wasteType,
        timestamp: new Date().toISOString(),
        latitude: scanLocation?.lat || 0,
        longitude: scanLocation?.lng || 0
      });

      toast({
        title: 'Collection Logged!',
        description: `${wasteType} waste collection recorded for user ${scannedUserId}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log collection',
        variant: 'destructive'
      });
    }

    setShowWasteSelector(false);
    setScannedUserId(null);
    setScanLocation(null);
  };

  const wasteTypes: { type: WasteType; icon: string; color: string }[] = [
    { type: 'Dry', icon: '📄', color: 'waste-dry' },
    { type: 'Wet', icon: '🍎', color: 'waste-wet' },
    { type: 'Recyclable', icon: '♻️', color: 'waste-recyclable' },
    { type: 'Other', icon: '🗑️', color: 'waste-other' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">SwachhSathi</h1>
              <p className="text-sm text-muted-foreground">Collector: {collectorId}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'dashboard' && <Dashboard collectorId={collectorId} />}

      {/* Scanner */}
      {activeView === 'scanner' && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setActiveView('dashboard')}
        />
      )}

      {/* Report Dumping */}
      {activeView === 'report' && (
        <ReportDumping
          collectorId={collectorId}
          onReportSubmitted={() => setActiveView('dashboard')}
          onClose={() => setActiveView('dashboard')}
        />
      )}

      {/* Waste Type Selector Modal */}
      {showWasteSelector && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Select Waste Type</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              User: {scannedUserId}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {wasteTypes.map((waste) => (
                <Button
                  key={waste.type}
                  onClick={() => handleWasteTypeSelect(waste.type)}
                  className={`h-20 flex-col gap-2 ${waste.color} text-white hover:opacity-90`}
                >
                  <span className="text-2xl">{waste.icon}</span>
                  <span className="text-sm font-medium">{waste.type}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
        <div className="flex justify-around">
          <Button
            variant={activeView === 'dashboard' ? 'default' : 'ghost'}
            className="flex-1 mx-1"
            onClick={() => setActiveView('dashboard')}
          >
            <User className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          
          <Button
            variant="default"
            className="flex-1 mx-1 bg-gradient-to-r from-primary to-primary-hover"
            onClick={() => setActiveView('scanner')}
          >
            <Scan className="mr-2 h-5 w-5" />
            Scan QR
          </Button>
          
          <Button
            variant={activeView === 'report' ? 'default' : 'ghost'}
            className="flex-1 mx-1"
            onClick={() => setActiveView('report')}
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
