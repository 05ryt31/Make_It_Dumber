import { motion } from 'motion/react';
import { Button } from './ui/button';

export type MotionType = 'earthquake' | 'sidewinder' | 'drunk' | 'mosquito' | 'liquid';

interface MotionSelectorProps {
  selectedMotion: MotionType | null;
  onMotionSelect: (motion: MotionType) => void;
}

const motionOptions = [
  { 
    id: 'earthquake' as MotionType, 
    name: 'EARTHQUAKE VERTICAL', 
    icon: '🌍',
    bgColor: 'from-red-600 to-orange-600',
    borderColor: 'border-red-400',
    glowColor: 'shadow-red-500/50',
    description: 'Vertical seismic chaos!'
  },
  { 
    id: 'sidewinder' as MotionType, 
    name: 'SIDEWINDER', 
    icon: '🐍',
    bgColor: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-400',
    glowColor: 'shadow-green-500/50',
    description: 'Horizontal serpent slither!'
  },
  { 
    id: 'drunk' as MotionType, 
    name: 'DRUNK TILT', 
    icon: '🍺',
    bgColor: 'from-yellow-600 to-amber-600',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-500/50',
    description: 'Wobbly party vibes!'
  },
  { 
    id: 'mosquito' as MotionType, 
    name: 'MOSQUITO MODE', 
    icon: '🦟',
    bgColor: 'from-pink-600 to-rose-600',
    borderColor: 'border-pink-400',
    glowColor: 'shadow-pink-500/50',
    description: 'Annoying micro-jitters!'
  },
  { 
    id: 'liquid' as MotionType, 
    name: 'LIQUID FLOOR', 
    icon: '🌊',
    bgColor: 'from-blue-600 to-cyan-600',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-cyan-500/50',
    description: 'Flowing wave madness!'
  }
];

export function MotionSelector({ selectedMotion, onMotionSelect }: MotionSelectorProps) {
  return (
    <motion.div 
      className="mb-8"
      animate={{ 
        x: [0, -1, 0, 1, 0] 
      }}
      transition={{ duration: 0.9, repeat: Infinity }}
    >
      <motion.h2 
        className="text-3xl text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        animate={{ 
          y: [0, -2, 0],
          textShadow: [
            "0 0 10px #ff1493",
            "0 0 20px #9400d3",
            "0 0 10px #ff1493"
          ]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        CHOOSE YOUR CHAOS
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motionOptions.map((option, index) => (
          <motion.div
            key={option.id}
            animate={{ 
              y: [0, -1, 0, 1, 0],
              rotate: [0, 0.3, 0, -0.3, 0]
            }}
            transition={{ 
              duration: 0.8 + index * 0.1, 
              repeat: Infinity,
              delay: index * 0.1
            }}
          >
            <Button
              onClick={() => onMotionSelect(option.id)}
              className={`w-full h-32 relative overflow-hidden border-3 transition-all duration-300 ${
                selectedMotion === option.id
                  ? `border-white shadow-2xl ${option.glowColor} scale-105`
                  : `${option.borderColor} hover:${option.borderColor} hover:shadow-lg ${option.glowColor}`
              }`}
              variant="outline"
            >
              {/* Vibrant background gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${option.bgColor}`}
                animate={{
                  opacity: selectedMotion === option.id ? [0.85, 1, 0.85] : [0.7, 0.85, 0.7]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-black/15" />
              
              <div className="relative z-10 text-center space-y-1">
                <motion.div 
                  className="text-4xl drop-shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  {option.icon}
                </motion.div>
                
                <motion.div 
                  className="text-sm font-black text-white drop-shadow-lg"
                  animate={{ 
                    y: [0, -1, 0, 1, 0] 
                  }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                  }}
                >
                  {option.name}
                </motion.div>
                
                <div 
                  className="text-xs text-white font-medium"
                  style={{
                    textShadow: '1px 1px 3px rgba(0,0,0,0.9)'
                  }}
                >
                  {option.description}
                </div>
              </div>
              
              {/* Animated glow effect for selected */}
              {selectedMotion === option.id && (
                <motion.div
                  className="absolute inset-0 border-3 border-white rounded-lg"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.6)",
                      "0 0 40px rgba(255,255,255,1)",
                      "0 0 60px rgba(255,255,255,0.8)",
                      "0 0 40px rgba(255,255,255,1)",
                      "0 0 20px rgba(255,255,255,0.6)"
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              
              {/* Sparkle effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}