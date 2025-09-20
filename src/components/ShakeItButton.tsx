import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Zap, Music } from 'lucide-react';

interface ShakeItButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export function ShakeItButton({ onClick, disabled, isProcessing }: ShakeItButtonProps) {
  return (
    <motion.div 
      className="flex justify-center mb-8"
      animate={{ 
        scale: [1, 1.02, 1],
        y: [0, -2, 0, 2, 0]
      }}
      transition={{ duration: 0.6, repeat: Infinity }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className="relative overflow-hidden text-2xl px-12 py-6 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 border-4 border-white shadow-lg disabled:opacity-50"
        size="lg"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div 
          className="relative z-10 flex items-center gap-3"
          animate={{
            x: [0, -1, 0, 1, 0],
            y: [0, -1, 0, 1, 0]
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-8 h-8" />
              </motion.div>
              <span>SHAKING...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, 0, -10, 0]
                }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >
                <Music className="w-8 h-8" />
              </motion.div>
              <span>SHAKE IT!</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 0, 10, 0]
                }}
                transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
              >
                <Zap className="w-8 h-8" />
              </motion.div>
            </>
          )}
        </motion.div>
        
        <motion.div
          className="absolute inset-0 border-4 border-white rounded-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(255,255,255,0.3)",
              "0 0 40px rgba(255,20,147,0.6)",
              "0 0 60px rgba(0,255,255,0.4)",
              "0 0 40px rgba(255,20,147,0.6)",
              "0 0 20px rgba(255,255,255,0.3)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </Button>
    </motion.div>
  );
}