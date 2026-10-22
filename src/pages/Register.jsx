import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Layers, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext/AuthContext';
import { useTheme } from '../context/ThemeContext/ThemeContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, loginWithSocial } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('كلمات المرور غير متطابقة.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginWithSocial(provider);
      navigate('/dashboard');
    } catch (error) {
      if (error.message !== 'تم إغلاق نافذة الدخول.') {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans dir-rtl relative transition-colors duration-200">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors cursor-pointer"
          title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            إنشاء حساب جديد
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            انضم إلى فريق TaskFlow وادُر مشاريعك بذكاء
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-right">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              الاسم الكامل
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أحمد محمد"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer mt-1"
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="relative flex py-1 items-center justify-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-zinc-400">أو التسجيل عبر</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* Social Buttons (Google & Facebook) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#1877F2"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <div className="text-center text-xs text-zinc-500 pt-1">
          لديك حساب بالفعل؟{' '}
          <Link
            to="/login"
            className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline mr-1"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
