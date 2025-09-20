import { motion } from 'motion/react';

export function Header() {
  return (
    <motion.div 
      className="text-center mb-8 relative"
      animate={{ 
        y: [0, -2, 0, 2, 0],
        rotate: [0, 0.5, 0, -0.5, 0]
      }}
      transition={{ 
        duration: 0.8, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <motion.h1 
        className="text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2"
        animate={{
          textShadow: [
            "0 0 20px #ff1493",
            "0 0 40px #9400d3", 
            "0 0 20px #00ffff",
            "0 0 40px #ff1493"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        JUST DANCE
      </motion.h1>
      
      <motion.div 
        className="text-lg text-cyan-400"
        animate={{ 
          opacity: [0.7, 1, 0.7],
          x: [-1, 1, -1]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🎵 SHAKE YOUR IMAGES TO THE BEAT 🎵
      </motion.div>
      
      {/* Strobe background effects */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-xl -z-10"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </motion.div>
  );
}