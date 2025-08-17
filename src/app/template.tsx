// app/template.tsx
'use client';

import { motion } from 'framer-motion';

// Definisikan varian animasi
const variants = {
  hidden: { opacity: 0, y: 20 }, // Keadaan awal (tersembunyi)
  enter: { opacity: 1, y: 0 },   // Keadaan akhir (masuk)
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial="hidden"       // Mulai dari 'hidden'
      animate="enter"        // Animasikan ke 'enter'
      transition={{ ease: 'linear', duration: 0.5 }} // Atur durasi dan tipe transisi
    >
      {children}
    </motion.main>
  );
}