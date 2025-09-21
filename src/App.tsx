import { useState } from "react";
import { motion } from "motion/react";
import { Header } from "./components/Header";
import { ImageUploader } from "./components/ImageUploader";
import {
  MotionSelector,
  MotionType,
} from "./components/MotionSelector";
import { ShakeItButton } from "./components/ShakeItButton";
import { EscapingDownloadButton } from "./components/EscapingDownloadButton";
import { ImagePreview } from "./components/ImagePreview";
import { generateVideo, VideoProvider } from "./api";

export default function App() {
  const [uploadedImage, setUploadedImage] =
    useState<File | null>(null);
  const [selectedMotion, setSelectedMotion] =
    useState<MotionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGeneratedEffect, setHasGeneratedEffect] =
    useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = 
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = 
    useState<VideoProvider>('local');

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setHasGeneratedEffect(false);
    setGeneratedVideoUrl(null);
    setError(null);
  };

  const handleMotionSelect = (motion: MotionType) => {
    setSelectedMotion(motion);
  };

  const handleShakeIt = async () => {
    if (!uploadedImage || !selectedMotion) return;

    setIsProcessing(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const result = await generateVideo(uploadedImage, {
        motion: selectedMotion,
        aspect: selectedProvider === 'veo' ? '9:16' : undefined,
        speed: 'fast',
        duration: 5,
        provider: selectedProvider
      });
      
      setGeneratedVideoUrl(result.url);
      setHasGeneratedEffect(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
      
      // Provide helpful error messages based on common issues
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        setError(`🚫 API quota exceeded. Try switching to ${selectedProvider === 'kling' ? 'Google Veo' : 'Kling AI'} or wait a few minutes.`);
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        setError('🔑 API key missing or invalid. Please check your .env file.');
      } else if (errorMessage.includes('timeout')) {
        setError('⏰ Generation timeout. The AI is taking too long - try a simpler motion or switch providers.');
      } else {
        setError(`❌ ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl || !selectedMotion) return;

    const link = document.createElement("a");
    link.href = generatedVideoUrl;
    link.download = `funky-${selectedMotion}-shake.mp4`;
    link.click();
  };

  const canShake =
    uploadedImage && selectedMotion && !isProcessing;
  const canDownload = hasGeneratedEffect && !isProcessing;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Static background - reduced complexity */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20" />

      {/* Simplified geometric shapes */}
      <motion.div
        className="fixed top-10 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="fixed top-1/3 right-10 w-16 h-16 bg-cyan-500/20 rotate-45 blur-lg"
        animate={{
          rotate: [45, 90, 45],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="fixed bottom-20 left-1/4 w-24 h-24 bg-purple-500/20 rounded-lg blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Static glitch scan lines - reduced performance impact */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff 2px, #ffffff 4px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Header />

        <div className="max-w-4xl mx-auto space-y-8">
          <ImageUploader
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
          />

          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MotionSelector
                selectedMotion={selectedMotion}
                onMotionSelect={handleMotionSelect}
              />
            </motion.div>
          )}

          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-md mx-auto mb-6"
            >
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-bold text-center text-cyan-400 mb-3">
                  🤖 AI ENGINE SELECTION 🤖
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedProvider('local')}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedProvider === 'local'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🚀 Local (Free)
                  </button>
                  <button
                    onClick={() => setSelectedProvider('kling')}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedProvider === 'kling'
                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ⚡ Kling AI
                  </button>
                  <button
                    onClick={() => setSelectedProvider('veo')}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedProvider === 'veo'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🎨 Veo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {canShake && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShakeItButton
                onClick={handleShakeIt}
                disabled={!canShake}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200"
            >
              <div className="text-center">
                <div className="text-lg font-bold mb-2">⚠️ Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </motion.div>
          )}

          <ImagePreview
            imageFile={uploadedImage}
            motionType={selectedMotion}
            isAnimating={isProcessing}
            generatedVideoUrl={generatedVideoUrl}
          />

          {/* Placeholder for escaping download button positioning */}
          {canDownload && (
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center text-pink-400">
                🎯 Find and click the download button!
              </div>
            </motion.div>
          )}
        </div>

        {/* Escaping download button - positioned absolutely across entire screen */}
        {canDownload && (
          <EscapingDownloadButton
            onDownload={handleDownload}
            disabled={!canDownload}
          />
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <div className="text-pink-400">
            🎵 Welcome to the Digital Nightclub - Where Images Get FUNKY! 🎵
          </div>
        </div>
      </div>
    </div>
  );
}