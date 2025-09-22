import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CollectorAPI } from '@/utils/api';
import { Leaf, Shield, Scan } from 'lucide-react';

interface LoginProps {
  onLogin: (collectorId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [collectorId, setCollectorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectorId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Collector ID',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const collector = await CollectorAPI.login(collectorId.trim());
      toast({
        title: 'Welcome!',
        description: `Logged in as ${collector.name}`,
      });
      onLogin(collector.id);
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Unable to login. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoIds = ['COLL001', 'COLL002', 'COLL003'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <Leaf className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            SwachhSathi
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground"
          >
            Collector App
          </motion.p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collectorId">Collector ID</Label>
                <Input
                  id="collectorId"
                  placeholder="Enter your collector ID"
                  value={collectorId}
                  onChange={(e) => setCollectorId(e.target.value)}
                  className="text-lg py-3"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo IDs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 p-4 bg-muted/50 rounded-lg backdrop-blur-sm"
        >
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Demo Collector IDs:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {demoIds.map((id) => (
              <Button
                key={id}
                variant="outline"
                size="sm"
                onClick={() => setCollectorId(id)}
                className="text-xs"
              >
                {id}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Scan className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">QR Scanner</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Leaf className="h-6 w-6 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">Log Collection</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-warning" />
            </div>
            <span className="text-xs text-muted-foreground">Report Issues</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;