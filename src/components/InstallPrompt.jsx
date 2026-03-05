import React, { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    
    // Show again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Android - Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Wait 30 seconds before showing prompt (let user explore first)
      setTimeout(() => {
        setShowAndroidPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS - Check if Safari on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;
    
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        setShowIOSPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
    setShowAndroidPrompt(false);
    setShowIOSPrompt(false);
  };

  if (isInstalled) return null;

  // Android Prompt
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-slide-up">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">
                Install TapeSure
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Install our app for faster access and offline support. Works just like a regular app!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAndroidInstall}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition active:scale-95"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition active:scale-95"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Prompt
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-slide-up">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">
                Install TapeSure
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Install this app on your iPhone:
              </p>
              <ol className="text-sm text-gray-300 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <Share className="w-4 h-4 inline mx-1" /> share button below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll and tap <Plus className="w-4 h-4 inline mx-1" /> "Add to Home Screen"</span>
                </li>
              </ol>
              <button
                onClick={handleDismiss}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition active:scale-95"
              >
                Got it!
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;