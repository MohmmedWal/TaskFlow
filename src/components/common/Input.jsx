import React from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="space-y-1.5 w-full text-right">
      {label && (
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl outline-none transition-all duration-200 ${
          error
            ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
            : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
