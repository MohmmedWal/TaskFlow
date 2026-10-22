import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Reusable accessible CustomSelect component with Dark/Light mode support,
 * custom icons, sleek animations, and outside-click handling.
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'اختر...',
  size = 'md', // 'sm' | 'md'
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  // Auto-scroll into view when opened so all options are clearly visible
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const sizeClasses = {
    sm: 'text-xs py-1 px-2.5 rounded-xl gap-1.5',
    md: 'text-xs py-1.5 px-3 rounded-xl gap-2',
  }[size] || 'text-xs py-1.5 px-3 rounded-xl gap-2';

  return (
    <div ref={containerRef} className={`relative inline-block text-start ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center justify-between border transition-all duration-150 outline-none cursor-pointer select-none ${sizeClasses} ${
          selectedOption?.buttonClass ||
          'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
        } ${isOpen ? 'ring-2 ring-zinc-400/30 dark:ring-zinc-600/30 border-zinc-400 dark:border-zinc-600' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - Drops Downwards and Ensures Everything is Visible */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute z-[100] top-full mt-1.5 min-w-[150px] max-w-[240px] w-max bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 start-0 ${
            menuClassName
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-start transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="truncate">{option.label}</span>
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

