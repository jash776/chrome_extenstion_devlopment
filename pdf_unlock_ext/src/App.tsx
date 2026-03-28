import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Lock, Unlock, Download, FileText, AlertCircle, CheckCircle2, X, Star, Key, ExternalLink, Crown } from 'lucide-react';

import { PDFDocument } from '@cantoo/pdf-lib';


// GUMROAD SETTINGS
const GUMROAD_PRODUCT_PERMALINK = 'ipizlr'; // e.g., 'pdfunlocker'
const GUMROAD_STORE_URL = `https://jashbhatt8.gumroad.com/l/${GUMROAD_PRODUCT_PERMALINK}`;

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'password_required' | 'decrypting' | 'success' | 'error' | 'premium_required'>('idle');
  const [isPremium, setIsPremium] = useState(false);
  const [unlocksUsed, setUnlocksUsed] = useState(0);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const MAX_FREE_UNLOCKS = 2;
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get usage & premium status from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed', 'isPremium'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
        if (typeof res.isPremium === 'boolean') setIsPremium(res.isPremium);
      });
    }
  }, []);

  useEffect(() => {
    // Get usage & premium status from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed', 'isPremium'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
        if (typeof res.isPremium === 'boolean') setIsPremium(res.isPremium);
      });
    }
  }, []);

  useEffect(() => {
    // Get usage & premium status from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed', 'isPremium'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
        if (typeof res.isPremium === 'boolean') setIsPremium(res.isPremium);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (decryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [decryptedUrl]);

  useEffect(() => {
    if (status === 'password_required') {
      // Small timeout to ensure the animation has started and element is mounted
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [status]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (unlocksUsed >= MAX_FREE_UNLOCKS && !isPremium) {
      setStatus('premium_required');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    setStatus('checking');
    setError(null);
    setDecryptedUrl(null);
    setPassword('');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Try to load without password to see if it's encrypted
      try {
        await PDFDocument.load(bytes);
        // If it loads without error, it's not encrypted
        setError('This PDF is not password protected.');
        setStatus('error');
      } catch (e: any) {
        if (e.message.includes('encrypted')) {
          setStatus('password_required');
        } else {
          setError('Failed to read the PDF file. It might be corrupted.');
          setStatus('error');
        }
      }
    } catch (err) {
      setError('An error occurred while reading the file.');
      setStatus('error');
    }
  };

  const verifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;
    
    setIsVerifying(true);
    setLicenseError(null);
    
    try {
      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          product_id: '-OdGljYQmh4Hj2nQ4_hH3A==',
          license_key: licenseKeyInput.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.purchase && !data.purchase.refunded && !data.purchase.chargebacked) {
        setIsPremium(true);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ isPremium: true });
        }
        setStatus('idle'); // go back to start
      } else {
        setLicenseError(data.message || 'Invalid or inactive license key.');
      }
    } catch (err) {
      setLicenseError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) return;

    setStatus('decrypting');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      try {
        const pdfDoc = await PDFDocument.load(bytes, { password });
        const decryptedBytes = await pdfDoc.save();
        
        const blob = new Blob([decryptedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setDecryptedUrl(url);
        setStatus('success');
        
        // update usage
        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }

      } catch (e: any) {
        if (e.message.includes('Password incorrect') || e.message.includes('password')) {
          setError('Incorrect password. Please try again.');
          setStatus('password_required');
        } else {
          setError('Failed to decrypt the PDF. ' + e.message);
          setStatus('error');
        }
      }
    } catch (err) {
      setError('An error occurred during decryption.');
      setStatus('error');
    }
  };

  const resetApp = () => {
    setFile(null);
    setStatus('idle');
    setPassword('');
    setError(null);
    if (decryptedUrl) {
      URL.revokeObjectURL(decryptedUrl);
      setDecryptedUrl(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Unlock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PDF Unlocker</h1>
          <p className="text-indigo-100 mt-1 text-sm font-medium">Remove passwords securely on your device</p>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 min-h-[320px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* IDLE / CHECKING STATE */}
            {(status === 'idle' || status === 'checking') && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
                    ${status === 'checking' ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} 
                    accept="application/pdf" 
                    className="hidden" 
                  />
                  
                  {status === 'checking' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600 font-medium">Analyzing PDF...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-indigo-50 p-4 rounded-full mb-4">
                        <UploadCloud className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-800 font-semibold mb-1 text-center">Tap to upload or drag & drop</p>
                      <p className="text-gray-500 text-sm text-center">Only protected PDF files</p>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex items-center text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                  <Lock className="w-3 h-3 mr-2" />
                  Processed locally. Files never leave your device.
                </div>
              </motion.div>
            )}

            {/* PASSWORD REQUIRED STATE */}
            {status === 'password_required' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col w-full"
              >
                <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">{file?.name}</p>
                    <p className="text-xs text-gray-500">{file ? formatFileSize(file.size) : ''} • Protected</p>
                  </div>
                  <button onClick={resetApp} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleDecrypt} className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">Enter PDF Password</label>
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      ref={passwordInputRef}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                      placeholder="Password"
                      required
                      autoFocus
                    />
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mb-4 flex items-start text-red-600 bg-red-50 p-3 rounded-lg text-sm"
                    >
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Unlock PDF
                  </button>
                </form>
              </motion.div>
            )}

            {/* DECRYPTING STATE */}
            {status === 'decrypting' && (
              <motion.div
                key="decrypting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Unlock className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Unlocking Document...</h3>
                <p className="text-gray-500 text-sm">Please wait a moment</p>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Successfully Unlocked!</h3>
                <p className="text-gray-500 text-sm mb-8">Your PDF is now free of password protection.</p>
                
                <div className="w-full flex flex-col gap-3">
                  <a
                    href={decryptedUrl!}
                    download={`unlocked_${file?.name}`}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Unlocked PDF
                  </a>
                  <button
                    onClick={resetApp}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Unlock Another File
                  </button>
                </div>
              </motion.div>
            )}

            {/* PREMIUM REQUIRED STATE */}
            {status === 'premium_required' && (
              <motion.div
                key="premium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <Crown className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Free Limit Reached</h3>
                <p className="text-gray-500 text-sm mb-6">You have used your 2 free PDF unlocks. Upgrade to Premium for unlimited use.</p>
                
                <form onSubmit={verifyLicense} className="w-full flex flex-col gap-3">
                  <a
                    href={GUMROAD_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Get a License Key
                  </a>
                  
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      placeholder="Paste your license key here"
                      required
                    />
                  </div>

                  {licenseError && (
                    <div className="text-red-500 text-xs font-semibold text-left w-full mt-1">
                      {licenseError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-colors ${
                      isVerifying ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify License'}
                  </button>
                  
                  <button
                    onClick={resetApp}
                    type="button"
                    className="w-full flex items-center justify-center py-3 px-4 mt-2 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </form>
              </motion.div>
            )}

{/* ERROR STATE (General) */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
                <p className="text-gray-600 text-sm mb-8">{error}</p>
                
                <button
                  onClick={resetApp}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-xs max-w-xs">
        <p>This tool runs entirely in your browser. Your files are never uploaded to any server.</p>
      </div>
    </div>
  );
}
