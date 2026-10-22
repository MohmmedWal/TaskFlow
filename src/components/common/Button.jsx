import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 shadow-sm',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
    outline:
      'border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
