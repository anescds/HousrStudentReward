import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface PaymentConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export const PaymentConfetti = ({ show, onComplete }: PaymentConfettiProps) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      setOpacity(1);
      
      // Start fading out after 2.5 seconds
      const fadeTimer = setTimeout(() => {
        setOpacity(0);
      }, 2500);
      
      // Complete after fade out
      if (onComplete) {
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 4000);
        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(completeTimer);
        };
      }
      
      return () => clearTimeout(fadeTimer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div 
      style={{ 
        opacity, 
        transition: 'opacity 1.5s ease-out',
        pointerEvents: 'none'
      }}
    >
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
      />
    </div>
  );
};
