import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrReader } from '@cmdnio/react-qr-reader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseQRCode, getScannerErrorMessage } from '@/utils/scanner';
import { getCurrentLocation } from '@/utils/location';
import { Camera, ScanLine, X, RotateCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (userId: string, location?: { lat: number; lng: number }) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check camera permissions on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 }, // Increased for better quality
            height: { ideal: 1080 },
            zoom: { ideal: 0.5 } // Zoomed out view
          } 
        });
        // Stop all tracks to release the camera
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
        setError(null);
      } catch (err) {
        console.error('Camera permission denied:', err);
        setHasCameraPermission(false);
        setError(getScannerErrorMessage(err));
      }
    };

    checkCameraPermission();
  }, []);

  const handleScan = useCallback(async (result: string | null) => {
    if (result && !isProcessing) {
      setIsProcessing(true);
      
      try {
        const scanResult = parseQRCode(result);
        
        if (scanResult.isValid && scanResult.userId) {
          // Get location
          try {
            const location = await getCurrentLocation();
            
            toast({
              title: 'QR Code Scanned!',
              description: `User ID: ${scanResult.userId}`,
            });

            onScanSuccess(scanResult.userId, {
              lat: location.latitude,
              lng: location.longitude
            });
          } catch (locationError) {
            // Proceed without location
            toast({
              title: 'QR Code Scanned!',
              description: `User ID: ${scanResult.userId} (Location unavailable)`,
            });
            onScanSuccess(scanResult.userId);
          }
        } else {
          toast({
            title: 'Invalid QR Code',
            description: scanResult.error || 'This QR code is not recognized',
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'Scan Error',
          description: 'Failed to process QR code',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onScanSuccess, toast, isProcessing]);

  const handleError = useCallback((error: any) => {
    console.error('QR Scanner Error:', error);
    // Only show error if we don't already have camera permission
    if (!hasCameraPermission) {
      const errorMessage = getScannerErrorMessage(error);
      setError(errorMessage);
      toast({
        title: 'Scanner Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [toast, hasCameraPermission]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const resetScanner = () => {
    setError(null);
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 500);
  };

  // Show error screen if camera permission is denied
  if (hasCameraPermission === false || error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-lg p-6 max-w-sm w-full text-center space-y-4"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Camera className="h-8 w-8 text-destructive" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-sm text-muted-foreground">
              {error || 'Please allow camera access to scan QR codes'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={resetScanner} className="flex-1">
              <RotateCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state while checking permissions
  if (hasCameraPermission === null) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white">Checking camera permissions...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/50 backdrop-blur-md rounded-full px-4 py-2"
          >
            <span className="text-white text-sm font-medium">Scan QR Code</span>
          </motion.div>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-black/50 backdrop-blur-md border-0 text-white hover:bg-black/70"
              onClick={toggleCamera}
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              variant="secondary"
              className="bg-black/50 backdrop-blur-md border-0 text-white hover:bg-black/70"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner - Full screen without overlay */}
      <div className="relative w-full h-full">
        {isScanning && (
          <QrReader
            key={facingMode}
            constraints={{
              facingMode,
              width: { ideal: 1920 }, // Higher resolution for zoomed out view
              height: { ideal: 1080 },
              zoom: { ideal: 0.5 } // Zoom out to show more area
            }}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text || null);
              }
              if (error) {
                handleError(error);
              }
            }}
            containerStyle={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
            videoStyle={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            videoContainerStyle={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          />
        )}

        {/* Transparent overlay with only the scan frame */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scan Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Scan Frame */}
              <div className="w-80 h-80 border-2 border-white/30 rounded-2xl relative bg-transparent">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg" />

                {/* Scanning line animation */}
                <motion.div
                  animate={{ y: [0, 304, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute left-0 right-0 h-1 bg-white rounded-full shadow-lg"
                  style={{ top: '12px' }}
                />
              </div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <div className="bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4 mx-4">
                  <div className="flex items-center justify-center mb-2">
                    <ScanLine className="h-6 w-6 text-white animate-pulse mr-2" />
                    <span className="text-white font-medium">
                      {isProcessing ? 'Processing...' : 'Position QR code within the frame'}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Hold steady for automatic scanning
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            variant="secondary"
            className="bg-black/50 backdrop-blur-md border-0 text-white hover:bg-black/70"
            onClick={onClose}
          >
            Cancel Scan
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default QRScanner;