"use client";

import React from "react";
// @ts-ignore
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  if (!text) return null;

  // ১. সাধারণ ভগ্নাংশ যেমন "১/৩" বা "4/5" কে স্বয়ংক্রিয়ভাবে LaTeX \frac{...}{...} এ রূপান্তর
  const preparedText = text.replace(
    /([০-৯\d]+)\/([০-৯\d]+)/g,
    (_, num, den) => `$\\frac{${num}}{${den}}$`
  );

  // ২. $...$ (ইনলাইন ম্যাথ) এবং সাধারণ টেক্সট আলাদা করা
  const parts = preparedText.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline-math-wrapper ${className}`}>
      {parts.map((part, index) => {
        // যদি এটি ম্যাথ এক্সপ্রেশন হয় ($ দিয়ে শুরু ও শেষ)
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className="inline-block px-0.5 align-middle"
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        // সাধারণ টেক্সট
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
