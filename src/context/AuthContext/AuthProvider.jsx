import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup,
    googleProvider,
    facebookProvider,
    doc,
    getDoc,
    setDoc,
    writeBatch,
    serverTimestamp
} from "../../lib/firebase";
import { validateRegistration, hasErrors } from "../../lib/validation";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Multi-account persistence on device
    const [savedAccounts, setSavedAccounts] = useState(() => {
        try {
            const raw = localStorage.getItem('taskflow_saved_accounts');
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            // إزالة أي حسابات وهمية سابقة
            const cleaned = parsed.filter(a =>
                a &&
                a.email &&
                a.email !== 'user.google@gmail.com' &&
                a.email !== 'user.facebook@facebook.com' &&
                !a.uid?.startsWith('social_')
            );
            if (cleaned.length !== parsed.length) {
                localStorage.setItem('taskflow_saved_accounts', JSON.stringify(cleaned));
            }
            return cleaned;
        } catch {
            return [];
        }
    });

    const saveAccountToDevice = (account) => {
        if (!account || !account.email) return;
        try {
            const email = account.email.trim().toLowerCase();
            const displayName = account.displayName || email.split('@')[0];
            const uid = account.uid;
            const photoURL = account.photoURL || null;
            const provider = account.provider || account.providerData?.[0]?.providerId || (email.includes('google') ? 'google.com' : email.includes('facebook') ? 'facebook.com' : 'password');
            const raw = localStorage.getItem('taskflow_saved_accounts');
            let list = raw ? JSON.parse(raw) : [];
            list = list.filter((a) => a.uid !== uid && a.email.toLowerCase() !== email);
            list.unshift({
                uid,
                email,
                displayName,
                photoURL,
                provider,
                lastActive: Date.now(),
            });
            localStorage.setItem('taskflow_saved_accounts', JSON.stringify(list));
            setSavedAccounts(list);
        } catch (err) {
            console.warn('Error saving account to device:', err);
        }
    };

    const switchAccount = async (targetAccount) => {
        if (!targetAccount) return;
        try {
            await signOut(auth).catch(() => {});
            localStorage.setItem('taskflow_local_auth_user', JSON.stringify(targetAccount));
            setUser(targetAccount);
            saveAccountToDevice(targetAccount);
            return true;
        } catch (err) {
            console.error('Error switching account:', err);
            throw err;
        }
    };

    const removeSavedAccount = (uid) => {
        try {
            const raw = localStorage.getItem('taskflow_saved_accounts');
            let list = raw ? JSON.parse(raw) : [];
            list = list.filter((a) => a.uid !== uid);
            localStorage.setItem('taskflow_saved_accounts', JSON.stringify(list));
            setSavedAccounts(list);
        } catch (err) {
            console.warn('Error removing saved account:', err);
        }
    };

    // Auto-save any active user to device list
    useEffect(() => {
        if (user && user.email) {
            saveAccountToDevice(user);
        }
    }, [user?.uid, user?.email, user?.displayName]);

    // دالة آمنة لمزامنة الملف الشخصي في Firestore بالخلفية دون حظر أو تعطيل تسجيل الدخول
    const syncUserProfileSilently = async (loggedUser) => {
        if (!loggedUser || !loggedUser.email) return;
        try {
            const cleanEmail = loggedUser.email.trim().toLowerCase();
            const cleanName = loggedUser.displayName || cleanEmail.split("@")[0];
            const userRef = doc(db, "users", loggedUser.uid);
            const userEmailRef = doc(db, "userEmails", cleanEmail);

            const userDoc = await getDoc(userRef).catch(() => null);

            if (!userDoc || !userDoc.exists()) {
                const batch = writeBatch(db);
                batch.set(userRef, {
                    displayName: cleanName,
                    email: cleanEmail,
                    createdAt: serverTimestamp()
                });
                batch.set(userEmailRef, {
                    uid: loggedUser.uid,
                    displayName: cleanName
                });
                await batch.commit().catch((err) => {
                    console.warn("Silent profile sync write pending/warning:", err.message);
                });
            }
        } catch (err) {
            console.warn("Non-blocking background sync notice:", err.message);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            const savedLocal = localStorage.getItem('taskflow_local_auth_user');
            let preferredLocal = null;
            if (savedLocal) {
                try {
                    preferredLocal = JSON.parse(savedLocal);
                    // تنظيف أي حسابات وهمية سابقة
                    if (
                        preferredLocal &&
                        (preferredLocal.email === 'user.google@gmail.com' ||
                         preferredLocal.email === 'user.facebook@facebook.com' ||
                         preferredLocal.uid?.startsWith('social_') ||
                         preferredLocal.uid?.startsWith('usr_'))
                    ) {
                        localStorage.removeItem('taskflow_local_auth_user');
                        preferredLocal = null;
                    }
                } catch {}
            }

            if (preferredLocal && preferredLocal.uid) {
                // If user selected an active account locally, respect it
                setUser(preferredLocal);
                saveAccountToDevice(preferredLocal);
                setLoading(false);
                if (currentUser && currentUser.uid === preferredLocal.uid) {
                    syncUserProfileSilently(currentUser);
                }
            } else if (currentUser) {
                const userObj = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email?.split('@')[0],
                    photoURL: currentUser.photoURL || null,
                    provider: currentUser.providerData?.[0]?.providerId || 'password',
                };
                localStorage.setItem('taskflow_local_auth_user', JSON.stringify(userObj));
                setUser(userObj);
                saveAccountToDevice(userObj);
                syncUserProfileSilently(currentUser);
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        try {
            return await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (error) {
            console.error("Login Error:", error);
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential'
            ) {
                throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error("صيغة البريد الإلكتروني غير صحيحة.");
            }
            if (error.code === 'auth/user-disabled') {
                throw new Error("تم تعطيل هذا الحساب من قبل الإدارة.");
            }
            if (error.code === 'auth/too-many-requests') {
                throw new Error("محاولات كثيرة خاطئة. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.");
            }
            if (error.code === 'auth/operation-not-allowed') {
                throw new Error("تسجيل الدخول بالبريد الإلكتروني غير مفعّل في لوحة Firebase Console.");
            }
            throw new Error(error.message || "حدث خطأ أثناء تسجيل الدخول.");
        }
    };

    const register = async (name, email, password, confirmPassword) => {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const errors = validateRegistration({
            displayName: cleanName,
            email: cleanEmail,
            password,
            confirmPassword
        });

        if (hasErrors(errors)) {
            const firstError = Object.values(errors)[0];
            throw new Error(firstError);
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            const newUser = userCredential.user;

            try {
                await updateProfile(newUser, { displayName: cleanName });

                const batch = writeBatch(db);
                batch.set(doc(db, "users", newUser.uid), {
                    displayName: cleanName,
                    email: cleanEmail,
                    createdAt: serverTimestamp()
                });
                batch.set(doc(db, "userEmails", cleanEmail), {
                    uid: newUser.uid,
                    displayName: cleanName
                });
                await batch.commit();
                return newUser;
            } catch (error) {
                console.warn("Error saving user document:", error);
                return newUser;
            }
        } catch (error) {
            console.error("Register Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error("هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.");
            }
            if (error.code === 'auth/weak-password') {
                throw new Error("كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 خانات على الأقل.");
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error("صيغة البريد الإلكتروني غير صحيحة.");
            }
            if (error.code === 'auth/operation-not-allowed') {
                throw new Error("إنشاء الحسابات بالبريد الإلكتروني غير مفعّل في لوحة Firebase Console.");
            }
            throw new Error(error.message || "حدث خطأ أثناء إنشاء الحساب.");
        }
    };

    const loginWithSocial = async (providerName) => {
        let provider;
        if (providerName === 'google') provider = googleProvider;
        if (providerName === 'facebook') provider = facebookProvider;

        if (!provider) return;

        try {
            const result = await signInWithPopup(auth, provider);
            const loggedUser = result.user;

            const socialUser = {
                uid: loggedUser.uid,
                email: loggedUser.email,
                displayName: loggedUser.displayName || loggedUser.email?.split('@')[0],
                photoURL: loggedUser.photoURL || null,
                provider: providerName === 'google' ? 'google.com' : 'facebook.com',
            };

            localStorage.setItem('taskflow_local_auth_user', JSON.stringify(socialUser));
            setUser(socialUser);
            saveAccountToDevice(socialUser);
            syncUserProfileSilently(loggedUser);
            return socialUser;
        } catch (error) {
            console.error("Social Login Error:", error);

            if (
                error.code === 'auth/popup-closed-by-user' ||
                error.code === 'auth/cancelled-popup-request'
            ) {
                throw new Error("تم إغلاق نافذة تسجيل الدخول قبل إتمام التحقق.");
            }

            if (error.code === 'auth/popup-blocked') {
                throw new Error("حظر المتصفح النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة (Popups) ثم المحاولة مجدداً.");
            }

            if (error.code === 'auth/account-exists-with-different-credential') {
                throw new Error("يوجد حساب مسجل مسبقاً بنفس البريد الإلكتروني باستخدام مزود آخر.");
            }

            if (error.code === 'auth/unauthorized-domain') {
                throw new Error("هذا النطاق غير مصرّح به في Firebase. أضف الدومين في: Firebase Console -> Authentication -> Settings -> Authorized domains.");
            }

            if (error.code === 'auth/operation-not-allowed') {
                if (providerName === 'google') {
                    throw new Error("تسجيل الدخول عبر Google غير مفعّل في Firebase Console. ادخل إلى Authentication -> Sign-in method -> Google واضغط تفعيل (Enable).");
                }
                if (providerName === 'facebook') {
                    throw new Error("تسجيل الدخول عبر Facebook غير مفعّل في Firebase Console.");
                }
                throw new Error("طريقة تسجيل الدخول هذه غير مفعّلة في لوحة تحكم Firebase.");
            }

            if (error.code === 'auth/configuration-not-found') {
                if (providerName === 'facebook') {
                    throw new Error("تسجيل الدخول عبر Facebook يتطلب ربط App ID و App Secret من حساب المطورين Meta داخل Firebase Console.");
                }
                throw new Error("إعدادات المزود غير مكتملة في Firebase Console.");
            }

            throw new Error(error.message || "حدث خطأ أثناء تسجيل الدخول الاجتماعي.");
        }
    };

    const updateUserProfile = async ({ displayName }) => {
        const cleanName = displayName.trim();
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: cleanName }).catch(() => {});
        }
        setUser((prev) => {
            const updated = prev ? { ...prev, displayName: cleanName } : null;
            if (updated) {
                try {
                    localStorage.setItem('taskflow_local_auth_user', JSON.stringify(updated));
                } catch {}
            }
            return updated;
        });

        try {
            const uid = auth.currentUser?.uid || user?.uid;
            const email = auth.currentUser?.email || user?.email;
            if (uid) {
                const userRef = doc(db, "users", uid);
                await setDoc(userRef, { displayName: cleanName }, { merge: true });
            }
            if (email) {
                const userEmailRef = doc(db, "userEmails", email.trim().toLowerCase());
                await setDoc(userEmailRef, { displayName: cleanName }, { merge: true });
            }
        } catch (err) {
            console.warn("Silent profile update in firestore failed:", err);
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('taskflow_local_auth_user');
        } catch {}
        await signOut(auth).catch(() => {});
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithSocial, logout, updateUserProfile, savedAccounts, switchAccount, removeSavedAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
