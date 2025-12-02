import React, { useState } from 'react';
import { IconActivity } from '../components/icons';
import { Button } from '../components/Button';

interface LoginPageProps {
  onLogin: (passcode: string) => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100));

    if (onLogin(passcode)) {
      setPasscode('');
    } else {
      setError('Invalid passcode. Please try again.');
      setPasscode('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <IconActivity width={32} height={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Instrumentator</h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md px-4">
        <div className="bg-white border-2 border-primary p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="text-primary/70">
              <IconActivity width={48} height={48} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-primary mb-2">
            Welcome
          </h2>
          <p className="text-center text-primary/60 text-sm mb-8">
            Enter the passcode to access Instrumentator
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Passcode Input */}
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-primary mb-2">
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode"
                className="w-full px-4 py-2 border border-primary bg-white focus:ring-2 focus:ring-primary/20 outline-none text-primary placeholder:text-primary/40 transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-300">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!passcode.trim() || isLoading}
              className="w-full mt-6"
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-primary/40 text-xs mt-6">
            Protected by passcode authentication
          </p>
        </div>
      </div>
    </div>
  );
};
