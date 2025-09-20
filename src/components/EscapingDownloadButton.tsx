import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Download, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface EscapingDownloadButtonProps {
  onDownload: () => void;
  disabled: boolean;
}

export function EscapingDownloadButton({ onDownload, disabled }: EscapingDownloadButtonProps) {
  const [clickAttempts, setClickAttempts] = useState(0);
  const [position, setPosition] = useState({ x: '50%', y: '50%' });
  const [isEscaping, setIsEscaping] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  
  const maxAttempts = 5; // More attempts for more fun!

  const handleClick = () => {
    if (disabled) return;

    if (clickAttempts < maxAttempts) {
      // Make the button "escape" dramatically across the entire screen
      setIsEscaping(true);
      setClickAttempts(prev => prev + 1);
      setShowHearts(true);
      
      // Generate random positions across the entire viewport
      const positions = [
        { x: '10%', y: '20%' },   // Top left
        { x: '90%', y: '15%' },   // Top right  
        { x: '5%', y: '80%' },    // Bottom left
        { x: '85%', y: '85%' },   // Bottom right
        { x: '50%', y: '10%' },   // Top center
        { x: '20%', y: '50%' },   // Left center
        { x: '80%', y: '60%' },   // Right center
        { x: '60%', y: '90%' },   // Bottom center
        { x: '30%', y: '30%' },   // Random positions
        { x: '70%', y: '70%' },
        { x: '15%', y: '60%' },
        { x: '95%', y: '40%' }
      ];
      
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      setPosition(randomPosition);
      
      // Reset escaping state after animation
      setTimeout(() => {
        setIsEscaping(false);
        setShowHearts(false);
      }, 800);
    } else {
      // Allow download after enough attempts
      onDownload();
      setClickAttempts(0);
      setPosition({ x: '50%', y: '50%' });
    }
  };

  const getButtonText = () => {
    if (clickAttempts === 0) return "DOWNLOAD GIF";
    if (clickAttempts === 1) return "Catch me~";
    if (clickAttempts === 2) return "Hey! Stop chasing me!";
    if (clickAttempts === 3) return "You still can't catch me~";
    if (clickAttempts === 4) return "Fine, I guess...";
    return "Okay, here's your download!";
  };

  const getButtonColor = () => {
    if (clickAttempts >= maxAttempts) return "from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500";
    if (clickAttempts >= 3) return "from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500";
    if (clickAttempts >= 2) return "from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500";
    if (clickAttempts >= 1) return "from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500";
    return "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500";
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          rotate: isEscaping ? [0, 180] : [0, 1, 0, -1, 0],
          scale: isEscaping ? [1, 1.2, 1] : [1, 1.02, 1]
        }}
        transition={{
          left: { duration: 0.6, ease: "easeOut" },
          top: { duration: 0.6, ease: "easeOut" },
          rotate: { 
            duration: isEscaping ? 0.5 : 2, 
            repeat: isEscaping ? 0 : Infinity,
            ease: "easeInOut"
          },
          scale: { 
            duration: isEscaping ? 0.5 : 1, 
            repeat: isEscaping ? 0 : Infinity 
          }
        }}
      >
        <Button
          onClick={handleClick}
          disabled={disabled}
          className={`relative overflow-hidden px-6 py-3 text-base border-4 border-white shadow-2xl disabled:opacity-50 bg-gradient-to-r ${getButtonColor()} transform hover:scale-105`}
        >
          {/* Sparkle effects */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/30 via-pink-300/20 to-white/30"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              x: ["-100%", "100%"]
            }}
            transition={{ 
              opacity: { duration: 0.8, repeat: Infinity },
              x: { duration: 1.5, repeat: Infinity, ease: "linear" }
            }}
          />
          
          <motion.div 
            className="relative z-10 flex items-center gap-2"
            animate={{
              y: [0, -1, 0, 1, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <motion.div
              animate={{
                rotate: clickAttempts >= maxAttempts ? 0 : [0, 20, 0, -20, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 0.4, repeat: Infinity },
                scale: { duration: 0.6, repeat: Infinity }
              }}
            >
              {clickAttempts >= maxAttempts ? (
                <Download className="w-5 h-5" />
              ) : clickAttempts >= 2 ? (
                <Heart className="w-5 h-5 text-pink-200" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </motion.div>
            
            <span className="whitespace-nowrap">{getButtonText()}</span>
          </motion.div>
          
          {/* Glowing border effect */}
          <motion.div
            className="absolute inset-0 border-4 border-pink-400 rounded-lg opacity-50"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,20,147,0.5)",
                "0 0 40px rgba(255,105,180,0.8)",
                "0 0 60px rgba(255,20,147,1)",
                "0 0 40px rgba(255,105,180,0.8)",
                "0 0 20px rgba(255,20,147,0.5)"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </Button>
        
        {/* Flying hearts when escaping */}
        {showHearts && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-pink-400 text-xl pointer-events-none"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 0.5
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: 0,
                  scale: 1.5,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                💕
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      
      {/* Attempt counter in a cute style */}
      {clickAttempts > 0 && clickAttempts < maxAttempts && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-pink-600/90 text-white px-4 py-2 rounded-full text-sm border-2 border-white shadow-lg z-50"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: [0.8, 1.1, 1],
            rotate: [0, 3, -3, 0]
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            scale: { duration: 0.3 },
            rotate: { duration: 0.5, repeat: Infinity }
          }}
        >
          <span className="flex items-center gap-1">
            💖 {clickAttempts}/{maxAttempts} tries - Keep trying harder!
          </span>
        </motion.div>
      )}
    </div>
  );
}