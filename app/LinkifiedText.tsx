import React from 'react';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export default function LinkifiedText({ text, className }: LinkifiedTextProps) {
  // URL regex: matches http, https, and www links
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  const parts = text.split(urlRegex);

  return (
    <div className={className}>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          let href = part;
          if (part.startsWith('www.')) {
            href = `https://${part}`;
          }
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
