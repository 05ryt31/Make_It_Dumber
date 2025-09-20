import { motion } from 'motion/react';
import { Upload, ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImage: File | null;
}

export function ImageUploader({ onImageUpload, uploadedImage }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      onImageUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <motion.div
      className="relative mb-8"
      animate={{ 
        y: [0, -1, 0, 1, 0],
        rotate: [0, 0.2, 0, -0.2, 0]
      }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <motion.div
        className={`border-4 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-pink-500 bg-pink-500/10 shadow-pink-500/50' 
            : uploadedImage
            ? 'border-green-500 bg-green-500/10 shadow-green-500/50'
            : 'border-purple-500 bg-purple-500/10 shadow-purple-500/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          boxShadow: [
            "0 0 20px rgba(139, 69, 19, 0.5)",
            "0 0 40px rgba(255, 20, 147, 0.7)",
            "0 0 20px rgba(0, 255, 255, 0.5)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.02 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ 
            y: [0, -5, 0, 5, 0],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          {uploadedImage ? (
            <div className="space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <ImageIcon className="w-16 h-16 mx-auto text-green-400" />
              </motion.div>
              <div className="text-xl text-green-400">
                🎉 IMAGE LOADED: {uploadedImage.name} 🎉
              </div>
              <div className="text-cyan-400">Ready to get FUNKY!</div>
            </div>
          ) : (
            <div className="space-y-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Upload className="w-16 h-16 mx-auto text-purple-400" />
              </motion.div>
              <div className="text-xl text-purple-400">
                DROP YOUR IMAGE INTO THE CHAOS
              </div>
              <div className="text-cyan-400">
                or click to browse files
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}