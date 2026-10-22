import React from 'react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans dir-rtl selection:bg-zinc-800">
            <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="space-y-1.5 text-right">
                    <div className="w-8 h-8 bg-zinc-100 text-zinc-950 rounded-lg flex items-center justify-center font-bold text-sm mb-3">
                        TF
                    </div>
                    <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-zinc-500 leading-relaxed">{subtitle}</p>}
                </div>

                {children}
            </div>
        </div>
    );
}