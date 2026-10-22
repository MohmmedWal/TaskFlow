import React from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function RegisterForm({
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    isLoading,
    errorMessage
}) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
                <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                    {errorMessage}
                </div>
            )}

            <Input
                label="الاسم الكامل"
                type="text"
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <Input
                label="كلمة السر"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <Input
                label="تأكيد كلمة السر"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            <Button type="submit" isLoading={isLoading} className="mt-2">
                إنشاء حساب جديد
            </Button>
        </form>
    );
}