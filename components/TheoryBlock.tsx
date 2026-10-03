'use client';

import { useMemo } from 'react';

interface TheoryBlockProps {
  content: string;
  className?: string;
}

// SQL keywords for syntax highlighting
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'DISTINCT',
  'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'UNION', 'INTERSECT', 'EXCEPT', 'EXISTS', 'ANY', 'ALL', 'WITH', 'RECURSIVE',
  'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES'
];

export default function TheoryBlock({ content, className = '' }: TheoryBlockProps) {
  const renderedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <div className={`theory-block w-full max-w-none space-y-6 ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
}

function parseMarkdown(markdown: string): string {
  let text = markdown;
  const placeholders: string[] = [];

  // 1. Protect code blocks (``` ... ```)
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'sql';
    const trimmedCode = code.trim();
    const highlightedCode = language === 'sql' ? highlightSQL(trimmedCode) : escapeHtml(trimmedCode);
    const blockHtml = `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-lang">${language.toUpperCase()}</span>
        <span class="code-block-label">Syntax</span>
      </div>
      <pre class="code-block"><code class="language-${language}">${highlightedCode}</code></pre>
    </div>`;
    const idx = placeholders.length;
    placeholders.push(blockHtml);
    return `\n__THEORY_BLOCK_PLACEHOLDER_${idx}__\n`;
  });

  // 2. Protect inline code (`...`)
  text = text.replace(/`([^`]+)`/g, (_, codeContent) => {
    const inlineHtml = `<code class="inline-code">${escapeHtml(codeContent)}</code>`;
    const idx = placeholders.length;
    placeholders.push(inlineHtml);
    return `__THEORY_INLINE_PLACEHOLDER_${idx}__`;
  });

  // 3. Escape literal backslash-escaped asterisks (\*) to &#42;
  text = text.replace(/\\\*/g, '&#42;');

  const lines = text.split('\n');
  const resultBlocks: string[] = [];
  let i = 0;

  function inlineFormat(str: string): string {
    let formatted = str;
    // Bold: **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Italic: *text* (matches only when preceded/followed by whitespace or punctuation to avoid eating literal * in SQL expressions)
    formatted = formatted.replace(/(?<=\s|^)\*([^\s*][^*]*[^\s*]|[^\s*])\*(?=\s|[.,!?]|$)/g, '<em class="text-slate-300 italic">$1</em>');
    return formatted;
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Code block placeholder line
    if (trimmed.startsWith('__THEORY_BLOCK_PLACEHOLDER_')) {
      resultBlocks.push(trimmed);
      i++;
      continue;
    }

    // Headers
    if (trimmed.startsWith('#')) {
      const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        if (level === 2) {
          const icons: Record<string, string> = {
            'Mental Model': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
            'How It Works': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
            'When To Use This': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            'Syntax': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>',
            'Operators': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>',
            'Key Rules': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
            'Key Points': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
            'Overview': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>'
          };
          const icon = icons[title] || '';
          if (icon) {
            resultBlocks.push(`<h2 class="section-header section-header-special">${icon}<span>${inlineFormat(title)}</span></h2>`);
          } else {
            resultBlocks.push(`<h2 class="section-header section-header-h2">${inlineFormat(title)}</h2>`);
          }
        } else if (level === 1) {
          resultBlocks.push(`<h1 class="section-header section-header-h1">${inlineFormat(title)}</h1>`);
        } else {
          resultBlocks.push(`<h3 class="section-header section-header-h3">${inlineFormat(title)}</h3>`);
        }
        i++;
        continue;
      }
    }

    // Callout / Blockquote (starts with '>')
    if (trimmed.startsWith('>')) {
      const calloutLines: string[] = [];
      while (i < lines.length) {
        const currTrim = lines[i].trim();
        if (!currTrim) break; // blank line terminates blockquote
        if (currTrim.startsWith('__THEORY_BLOCK_PLACEHOLDER_') || currTrim.startsWith('#') || currTrim.startsWith('|') || /^[*-]\s+/.test(currTrim) || /^\d+\.\s+/.test(currTrim)) {
          break; // new block type terminates blockquote
        }
        calloutLines.push(currTrim.replace(/^>\s?/, ''));
        i++;
      }

      const fullCalloutText = calloutLines.join(' ').trim();
      let typeClass = 'callout-key-concept';
      let titleLabel = 'key concept';

      if (/key\s*concept/i.test(fullCalloutText) || /💡/.test(fullCalloutText)) {
        typeClass = 'callout-key-concept';
        titleLabel = 'key concept';
      } else if (/why\s*this\s*matters/i.test(fullCalloutText) || /🎯/.test(fullCalloutText)) {
        typeClass = 'callout-why-matters';
        titleLabel = 'why this matters';
      } else if (/common\s*mistake/i.test(fullCalloutText) || /warning/i.test(fullCalloutText) || /⚠️/.test(fullCalloutText)) {
        typeClass = 'callout-warning';
        titleLabel = 'common mistake';
      } else if (/pro\s*tip/i.test(fullCalloutText) || /tip/i.test(fullCalloutText) || /⚡/.test(fullCalloutText) || /✨/.test(fullCalloutText)) {
        typeClass = 'callout-pro-tip';
        titleLabel = 'pro tip';
      }

      // Strip leading emoji and title header prefix from callout body text
      let bodyText = fullCalloutText
        .replace(/^(?:💡|🎯|⚠️|⚡|✨|\s)+/, '')
        .replace(/^\*\*(?:Key(?: Concept)?|Why This Matters|Common Mistake|Warning|(?:Pro )?Tip|Note)[:\s]*\*\*\s*/i, '')
        .trim();

      bodyText = inlineFormat(bodyText);

      resultBlocks.push(
        `<div class="callout ${typeClass}"><span class="callout-bang">!</span><span class="callout-title">${titleLabel}</span><span class="callout-content">${bodyText}</span></div>`
      );
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && i + 1 < lines.length && /^\|[-| :]+\|$/.test(lines[i + 1].trim())) {
      const headerRow = trimmed;
      i += 2; // skip header and divider lines
      const bodyRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        bodyRows.push(lines[i].trim());
        i++;
      }

      const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
      const rows = bodyRows.map(row => row.split('|').map(c => c.trim()).filter(Boolean));

      const thead = headers.map(h => `<th class="theory-table-header">${inlineFormat(h)}</th>`).join('');
      const tbody = rows.map((cells, idx) => {
        const tds = cells.map(c => `<td class="theory-table-cell">${inlineFormat(c)}</td>`).join('');
        return `<tr class="theory-table-row ${idx % 2 === 1 ? 'theory-table-row-alt' : ''}">${tds}</tr>`;
      }).join('');

      resultBlocks.push(`<div class="theory-table-wrapper"><table class="theory-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`);
      continue;
    }

    // Lists (Unordered or Ordered)
    const isUnordered = /^[*-]\s+/.test(trimmed);
    const isOrdered = /^\d+\.\s+/.test(trimmed);

    if (isUnordered || isOrdered) {
      const listItemsHtml: string[] = [];
      const isListOrdered = isOrdered;
      let itemCounter = 1;

      while (i < lines.length) {
        const currTrim = lines[i].trim();
        if (!currTrim) break; // blank line ends list block
        if (currTrim.startsWith('__THEORY_BLOCK_PLACEHOLDER_') || currTrim.startsWith('#') || currTrim.startsWith('|') || currTrim.startsWith('>')) {
          break; // new block type ends list block
        }

        const currUnordered = /^[*-]\s+/.test(currTrim);
        const currOrdered = /^\d+\.\s+/.test(currTrim);

        if (currUnordered || currOrdered) {
          // Start of a new list item
          const itemLines: string[] = [currTrim.replace(/^(?:[*-]|\d+\.)\s+/, '')];
          i++;

          // Collect continuation lines for this list item until next marker or blank line
          while (i < lines.length) {
            const nextTrim = lines[i].trim();
            if (!nextTrim) break;
            if (nextTrim.startsWith('__THEORY_BLOCK_PLACEHOLDER_') || nextTrim.startsWith('#') || nextTrim.startsWith('|') || nextTrim.startsWith('>') || /^[*-]\s+/.test(nextTrim) || /^\d+\.\s+/.test(nextTrim)) {
              break;
            }
            itemLines.push(nextTrim);
            i++;
          }

          const itemText = inlineFormat(itemLines.join(' ').trim());
          if (isListOrdered) {
            listItemsHtml.push(`<li class="theory-list-item theory-list-ordered"><span class="theory-list-ordered-number">${itemCounter}.</span><span class="theory-list-content">${itemText}</span></li>`);
            itemCounter++;
          } else {
            listItemsHtml.push(`<li class="theory-list-item"><span class="theory-list-marker" aria-hidden="true"></span><span class="theory-list-content">${itemText}</span></li>`);
          }
        } else {
          break;
        }
      }

      const tag = isListOrdered ? 'ol' : 'ul';
      const listClass = isListOrdered ? 'theory-list theory-list-ordered-group' : 'theory-list';
      resultBlocks.push(`<${tag} class="${listClass}">${listItemsHtml.join('')}</${tag}>`);
      continue;
    }

    // Paragraph (default block for continuous non-blank lines)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const currTrim = lines[i].trim();
      if (!currTrim) break;
      if (currTrim.startsWith('__THEORY_BLOCK_PLACEHOLDER_') || currTrim.startsWith('#') || currTrim.startsWith('|') || currTrim.startsWith('>') || /^[*-]\s+/.test(currTrim) || /^\d+\.\s+/.test(currTrim)) {
        break;
      }
      paragraphLines.push(currTrim);
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraphText = inlineFormat(paragraphLines.join(' ').trim());
      resultBlocks.push(`<p class="theory-paragraph">${paragraphText}</p>`);
    }
  }

  let finalHtml = resultBlocks.join('\n\n');

  // Restore inline placeholders first
  finalHtml = finalHtml.replace(/__THEORY_INLINE_PLACEHOLDER_(\d+)__/g, (_, idx) => placeholders[parseInt(idx, 10)] || '');
  // Restore block placeholders
  finalHtml = finalHtml.replace(/__THEORY_BLOCK_PLACEHOLDER_(\d+)__/g, (_, idx) => placeholders[parseInt(idx, 10)] || '');

  return finalHtml;
}

function highlightSQL(sql: string): string {
  let highlighted = escapeHtml(sql);

  // Highlight SQL keywords (case-insensitive, word boundaries)
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
  });

  // Highlight strings (single quotes)
  highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');

  // Highlight comments
  highlighted = highlighted.replace(/(--.*$)/gm, '<span class="sql-comment">$1</span>');

  // Highlight placeholders like column1, table_name, etc.
  highlighted = highlighted.replace(/\b(column\d*|table_name|columns|table|condition|value\d*|expression)\b/gi, '<span class="sql-placeholder">$1</span>');

  return highlighted;
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
