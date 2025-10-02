import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, PlayCircle, RotateCcw } from 'lucide-react';

/**
 * WelcomeBackModal Component
 * Shows when user has an unfinished interview session
 */
export default function WelcomeBackModal({ onContinue, onStartOver }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Welcome Back!</CardTitle>
          <CardDescription className="text-center">
            You have an unfinished interview session. Would you like to continue where you left off or start a new interview?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={onContinue} className="w-full" size="lg">
            <PlayCircle size={20} className="mr-2" />
            Continue Interview
          </Button>
          <Button onClick={onStartOver} variant="outline" className="w-full" size="lg">
            <RotateCcw size={20} className="mr-2" />
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
