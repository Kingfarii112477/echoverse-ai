'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100 over 3 seconds
    const duration = 3000;
    const interval = 30;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    // Redirect after 3.5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 3500);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // Calculate stroke dashoffset for circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen w-full bg-[#040404] relative overflow-hidden flex items-center justify-center">
      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsing concentric rings */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 1.2],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.4,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: '#aeecff',
                opacity: 0.8 - index * 0.2,
              }}
            />
          ))}

          {/* Logo in center */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10"
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logoGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Infinity symbol with waveform */}
              <path
                d="M30 60 Q45 30, 60 60 T90 60 Q105 90, 90 60 T60 60 Q45 30, 30 60 Z"
                stroke="url(#logoGradientLarge)"
                strokeWidth="4"
                fill="none"
              />
              {/* Waveform lines inside */}
              <path
                d="M36 60 Q42 51, 48 60 T60 60"
                stroke="url(#logoGradientLarge)"
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M60 60 Q66 69, 72 60 T84 60"
                stroke="url(#logoGradientLarge)"
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </motion.div>

          {/* Circular progress indicator */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Animated waveform bars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-end justify-center gap-1.5 h-16 mb-8"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
              animate={{
                height: ['20%', '80%', '20%'],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display text-3xl font-bold text-ev-primary">
            EchoVerse AI
          </h1>
          <p className="text-ev-on-surface-variant italic text-lg">
            Every Voice Has An Echo.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
