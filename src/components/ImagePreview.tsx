import { motion } from 'motion/react';
import { MotionType } from './MotionSelector';

interface ImagePreviewProps {
  imageFile: File | null;
  motionType: MotionType | null;
  isAnimating: boolean;
  generatedVideoUrl?: string | null;
}

const getMotionAnimation = (type: MotionType) => {
  switch (type) {
    case 'earthquake':
      return {
        y: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.8, repeat: Infinity }
      };
    case 'sidewinder':
      return {
        x: [0, -10, 10, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 1, repeat: Infinity }
      };
    case 'drunk':
      return {
        rotate: [0, 5, -3, 8, -6, 4, -2, 1, 0],
        x: [0, 2, -1, 3, -2, 1, 0],
        y: [0, 1, -2, 1, -1, 0],
        transition: { duration: 2, repeat: Infinity }
      };
    case 'mosquito':
      return {
        x: [0, 1, -1, 2, -2, 1, -1, 0],
        y: [0, -1, 1, -2, 2, -1, 1, 0],
        transition: { duration: 0.1, repeat: Infinity }
      };
    case 'liquid':
      return {
        y: [0, -6, 0, 6, 0],
        scale: [1, 1.02, 1, 0.98, 1],
        transition: { duration: 1.5, repeat: Infinity }
      };
    default:
      return {};
  }
};

export function ImagePreview({ imageFile, motionType, isAnimating, generatedVideoUrl }: ImagePreviewProps) {
  if (!imageFile) return null;

  const imageUrl = URL.createObjectURL(imageFile);
  const showGeneratedVideo = generatedVideoUrl && !isAnimating;

  return (
    <motion.div
      className="relative max-w-md mx-auto mb-8"
      animate={{
        scale: [1, 1.01, 1],
        rotate: [0, 0.2, 0, -0.2, 0]
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.h3 
        className="text-2xl text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        animate={{
          y: [0, -1, 0, 1, 0],
          textShadow: [
            "0 0 10px #00ffff",
            "0 0 20px #ff00ff",
            "0 0 10px #00ffff"
          ]
        }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        {isAnimating ? "🎉 GETTING FUNKY! 🎉" : showGeneratedVideo ? "🎬 FUNKY VIDEO READY! 🎬" : "PREVIEW"}
      </motion.h3>
      
      <motion.div
        className="relative overflow-hidden rounded-lg border-4 border-white shadow-2xl"
        animate={{
          boxShadow: [
            "0 0 20px rgba(255,255,255,0.3)",
            "0 0 40px rgba(255,20,147,0.5)",
            "0 0 60px rgba(0,255,255,0.4)",
            "0 0 40px rgba(255,20,147,0.5)",
            "0 0 20px rgba(255,255,255,0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {showGeneratedVideo ? (
          <video
            src={generatedVideoUrl}
            autoPlay
            loop
            muted
            className="w-full h-auto max-h-96 object-contain"
          />
        ) : (
          <motion.img
            src={imageUrl}
            alt="Uploaded image"
            className="w-full h-auto max-h-96 object-contain"
            animate={
              isAnimating && motionType
                ? getMotionAnimation(motionType)
                : {
                    scale: [1, 1.005, 1],
                    transition: { duration: 3, repeat: Infinity }
                  }
            }
          />
        )}
        
        {isAnimating && (
          <>
            {/* Strobe overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-transparent to-cyan-500/30"
              animate={{
                opacity: [0, 0.7, 0],
                x: ["-100%", "100%"]
              }}
              transition={{
                opacity: { duration: 0.5, repeat: Infinity },
                x: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* Particle effects */}
            <motion.div
              className="absolute top-0 left-0 w-2 h-2 bg-pink-500 rounded-full"
              animate={{
                x: [0, 300, 0],
                y: [0, 200, 400, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 rounded-full"
              animate={{
                x: [0, -300, 0],
                y: [0, 300, 200, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </motion.div>
      
      {motionType && (
        <motion.div
          className="mt-4 text-center text-lg"
          animate={{
            y: [0, -1, 0, 1, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <span className="text-yellow-400">Effect: </span>
          <span className="text-white font-black">
            {motionType.toUpperCase()}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}