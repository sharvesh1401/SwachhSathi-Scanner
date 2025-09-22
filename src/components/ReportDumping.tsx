import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CollectorAPI, convertFileToBase64 } from '@/utils/api';
import { getCurrentLocation } from '@/utils/location';
import { Camera, MapPin, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportDumpingProps {
  collectorId: string;
  onReportSubmitted: () => void;
  onClose: () => void;
}

const ReportDumping: React.FC<ReportDumpingProps> = ({ 
  collectorId, 
  onReportSubmitted, 
  onClose 
}) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      setLocation({
        lat: locationData.latitude,
        lng: locationData.longitude
      });
      toast({
        title: 'Location Captured',
        description: `Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Location Error',
        description: error.message || 'Unable to get current location',
        variant: 'destructive'
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Please capture your current location first',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let photoBase64 = '';
      if (photo) {
        photoBase64 = await convertFileToBase64(photo);
      }

      const report = await CollectorAPI.reportIllegalDumping({
        collector_id: collectorId,
        description: description.trim() || undefined,
        photo_base64: photoBase64 || undefined,
        timestamp: new Date().toISOString(),
        latitude: location.lat,
        longitude: location.lng,
        status: 'Pending'
      });

      toast({
        title: 'Report Submitted',
        description: 'Illegal dumping report has been submitted successfully',
      });

      onReportSubmitted();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-warning" />
                Report Illegal Dumping
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Section */}
              <div className="space-y-3">
                <Label>Photo Evidence</Label>
                
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Dumping evidence"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed border-2 hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Take Photo
                      </span>
                    </div>
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <Label>Location</Label>
                
                {location ? (
                  <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {isGettingLocation ? 'Getting Location...' : 'Capture Current Location'}
                  </Button>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the illegal dumping incident..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={!location || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportDumping;