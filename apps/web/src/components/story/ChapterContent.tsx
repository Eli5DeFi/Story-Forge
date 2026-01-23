'use client';

import { useMemo } from 'react';

interface ChapterContentProps {
  content: string;
}

export function ChapterContent({ content }: ChapterContentProps) {
  // Process content to add styling and paragraph breaks
  const processedContent = useMemo(() => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((paragraph, index) => {
      // Check if it's dialogue (starts with ")
      const isDialogue = paragraph.trim().startsWith('"');

      // Check if it's a scene break (just asterisks or dashes)
      const isSceneBreak = /^[\s*-]+$/.test(paragraph.trim());

      if (isSceneBreak) {
        return (
          <div key={index} className="my-8 flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary/50" />
            <span className="h-1 w-1 rounded-full bg-primary/50" />
            <span className="h-1 w-1 rounded-full bg-primary/50" />
          </div>
        );
      }

      // Process inline formatting
      const formattedContent = formatInlineText(paragraph);

      return (
        <p
          key={index}
          className={`mb-6 leading-relaxed ${
            isDialogue ? 'text-foreground' : 'text-foreground/90'
          }`}
        >
          {formattedContent}
        </p>
      );
    });
  }, [content]);

  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <div className="font-serif text-lg leading-8 md:text-xl md:leading-9">
        {processedContent}
      </div>
    </article>
  );
}

function formatInlineText(text: string): React.ReactNode {
  // Simple formatting for emphasis and strong text
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  // Match *italic* and **bold** patterns
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }

    if (match[2]) {
      // Bold text (**)
      parts.push(
        <strong key={key++} className="font-bold text-primary/90">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text (*)
      parts.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>
      );
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : text;
}
