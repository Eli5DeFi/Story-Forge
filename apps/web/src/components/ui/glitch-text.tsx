'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchOnHover?: boolean;
  continuous?: boolean;
}

export function GlitchText({
  text,
  className,
  glitchOnHover = false,
  continuous = false,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(continuous);

  useEffect(() => {
    if (continuous) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(interval);
    }
  }, [continuous]);

  return (
    <span
      className={cn('relative inline-block', className)}
      onMouseEnter={() => glitchOnHover && setIsGlitching(true)}
      onMouseLeave={() => glitchOnHover && setIsGlitching(false)}
      data-text={text}
    >
      <span className={cn(isGlitching && 'animate-glitch')}>{text}</span>
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 w-full h-full text-neon-blue opacity-70"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
              transform: 'translate(-2px, 0)',
            }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 w-full h-full text-neon-purple opacity-70"
            style={{
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
              transform: 'translate(2px, 0)',
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

// Typing effect text component
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  speed = 50,
  className,
  onComplete,
  cursor = true,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={cn('font-mono', className)}>
      {displayText}
      {cursor && (
        <span
          className={cn(
            'inline-block w-2 h-5 bg-neon-blue ml-1',
            isComplete ? 'animate-pulse' : ''
          )}
        />
      )}
    </span>
  );
}

// Scramble text effect
interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleOnHover?: boolean;
}

export function ScrambleText({
  text,
  className,
  scrambleOnHover = true,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  const scramble = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3;
    }, 30);
  };

  return (
    <span
      className={cn('font-mono', className)}
      onMouseEnter={() => scrambleOnHover && scramble()}
    >
      {displayText}
    </span>
  );
}
