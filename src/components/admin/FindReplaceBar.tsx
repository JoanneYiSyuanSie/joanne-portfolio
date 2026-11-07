import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Replace,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Check
} from 'lucide-react';

interface FindReplaceBarProps {
  content: string;
  onApplyContent: (newContent: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
}

export function FindReplaceBar({
  content,
  onApplyContent,
  textareaRef,
  onClose,
}: FindReplaceBarProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [feedback, setFeedback] = useState('');
  const findInputRef = useRef<HTMLInputElement>(null);

  // Focus find input on mount
  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  // Calculate all match positions in content
  const matches = useMemo(() => {
    if (!findText) return [];

    const results: number[] = [];
    const source = matchCase ? content : content.toLowerCase();
    const target = matchCase ? findText : findText.toLowerCase();

    let pos = source.indexOf(target);
    while (pos !== -1) {
      results.push(pos);
      pos = source.indexOf(target, pos + target.length);
    }
    return results;
  }, [content, findText, matchCase]);

  // Find Next Match and highlight in textarea
  const handleFindNext = () => {
    if (matches.length === 0) {
      setFeedback('找不到相符內容');
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentCursor = textarea.selectionEnd || 0;
    // Find the first match strictly after cursor, or wrap around to the first match
    let nextIndex = matches.find((pos) => pos >= currentCursor);
    if (nextIndex === undefined) {
      nextIndex = matches[0];
    }

    textarea.focus();
    textarea.setSelectionRange(nextIndex, nextIndex + findText.length);
    setFeedback('');
  };

  // Find Previous Match
  const handleFindPrev = () => {
    if (matches.length === 0) {
      setFeedback('找不到相符內容');
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentCursor = textarea.selectionStart || 0;
    // Find the last match strictly before cursor, or wrap around to the last match
    const reversed = [...matches].reverse();
    let prevIndex = reversed.find((pos) => pos < currentCursor);
    if (prevIndex === undefined) {
      prevIndex = matches[matches.length - 1];
    }

    textarea.focus();
    textarea.setSelectionRange(prevIndex, prevIndex + findText.length);
    setFeedback('');
  };

  // Replace Current Match (if cursor is on a match, replace it and jump to next)
  const handleReplaceSingle = () => {
    if (!findText || matches.length === 0) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;
    const selected = content.substring(selStart, selEnd);

    const isMatchSelected = matchCase
      ? selected === findText
      : selected.toLowerCase() === findText.toLowerCase();

    if (isMatchSelected) {
      const newContent = content.substring(0, selStart) + replaceText + content.substring(selEnd);
      onApplyContent(newContent);
      setFeedback('已取代 1 處');

      // Move cursor after the replaced text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            selStart + replaceText.length,
            selStart + replaceText.length
          );
        }
      }, 0);
    } else {
      // If nothing selected yet, jump to next match
      handleFindNext();
    }
  };

  // Replace All Matches
  const handleReplaceAll = () => {
    if (!findText) return;
    if (matches.length === 0) {
      setFeedback('找不到可取代的內容');
      return;
    }

    const count = matches.length;
    let newContent = '';

    if (matchCase) {
      newContent = content.split(findText).join(replaceText);
    } else {
      // Case-insensitive replace preserving non-matching parts
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      newContent = content.replace(regex, replaceText);
    }

    onApplyContent(newContent);
    setFeedback(`已全部取代 ${count} 處`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#1A1A1A] rounded-sm p-3 shadow-md animate-in fade-in duration-150 text-xs text-[#1A1A1A]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Find Input */}
          <div className="flex items-center bg-white border border-[#E5E0D8] rounded-sm px-2 py-1 focus-within:border-[#1A1A1A] flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#888888] mr-1.5 shrink-0" />
            <input
              ref={findInputRef}
              type="text"
              placeholder="尋找內容..."
              value={findText}
              onChange={(e) => {
                setFindText(e.target.value);
                setFeedback('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) handleFindPrev();
                  else handleFindNext();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className="w-full bg-transparent focus:outline-none font-serif text-xs text-[#1A1A1A]"
            />
            {findText && (
              <span className="font-mono text-[10px] text-[#888888] shrink-0 ml-1">
                {matches.length} 處
              </span>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center border border-[#E5E0D8] bg-white rounded-sm overflow-hidden shrink-0">
            <button
              type="button"
              onClick={handleFindPrev}
              disabled={matches.length === 0}
              className="p-1 text-[#4A4A4A] hover:bg-[#EAE5DC] disabled:opacity-30 cursor-pointer"
              title="上一個 (Shift + Enter)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFindNext}
              disabled={matches.length === 0}
              className="p-1 text-[#4A4A4A] hover:bg-[#EAE5DC] disabled:opacity-30 border-l border-[#E5E0D8] cursor-pointer"
              title="下一個 (Enter)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Replace Input */}
          <div className="flex items-center bg-white border border-[#E5E0D8] rounded-sm px-2 py-1 focus-within:border-[#1A1A1A] flex-1 min-w-[160px] max-w-xs">
            <Replace className="w-3.5 h-3.5 text-[#888888] mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="取代為..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceSingle();
                } else if (e.key === 'Escape') {
                  onClose();
                }
              }}
              className="w-full bg-transparent focus:outline-none font-serif text-xs text-[#1A1A1A]"
            />
          </div>

          {/* Replace Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReplaceSingle}
              disabled={!findText || matches.length === 0}
              className="px-2.5 py-1 bg-white border border-[#1A1A1A] hover:bg-[#EAE5DC] disabled:opacity-40 rounded-sm font-medium transition-colors cursor-pointer"
              title="取代目前選取的項目"
            >
              取代
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!findText || matches.length === 0}
              className="px-2.5 py-1 bg-[#1A1A1A] text-white hover:bg-[#333333] disabled:opacity-40 rounded-sm font-medium transition-colors cursor-pointer"
              title="全篇一次全部取代"
            >
              全部取代
            </button>
          </div>

          {/* Case Sensitivity Toggle */}
          <button
            type="button"
            onClick={() => setMatchCase((prev) => !prev)}
            className={`px-1.5 py-1 border rounded-sm font-mono text-[11px] cursor-pointer transition-colors shrink-0 ${
              matchCase
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                : 'bg-white text-[#888888] border-[#E5E0D8] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
            }`}
            title="區分英文大小寫"
          >
            Aa
          </button>
        </div>

        {/* Right Feedback & Close */}
        <div className="flex items-center gap-2 shrink-0">
          {feedback && (
            <span className="text-[#059669] font-medium animate-in fade-in text-[11px]">
              {feedback}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] rounded-sm cursor-pointer transition-colors"
            title="關閉 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
