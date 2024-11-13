import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ScreenShake = ({ children, triggerShake }) => {
  const controls = useAnimation();

  const shakeAnimation = {
    x: [0, -20, 0, -20, 0, 0, 0, -20, 0, -20, 0, 0], // Shakes back and forth
    y: [0, -10, -10, +10, +10, 0,0, -10, -10, +10, +10, 0], // Shakes back and forth
    transition: {
      duration: 0.6, // Duration of the shake
      ease: "easeInOut",
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], // Controls speed of each part of the shake
    },
  };

  // Trigger the shake animation when `triggerShake` is true
  React.useEffect(() => {
    if (triggerShake) {
      controls.start(shakeAnimation);
    }
  }, [triggerShake, controls]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
};

export default ScreenShake;
