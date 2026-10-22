export async function guardedWrite(operation, timeoutMs = 8000) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("أنت غير متصل بالإنترنت. يرجى التحقق من الاتصال والمحاولة مجدداً.");
    }
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            reject(
                new Error(
                    "لم يتمكن التطبيق من الاتصال بقاعدة بيانات Firestore. يرجى التأكد من تفعيل Cloud Firestore في Firebase Console."
                )
            );
        }, timeoutMs);
    });
    try {
        return await Promise.race([operation(), timeout]);
    } catch (error) {
        if (error.code === "permission-denied") {
            throw new Error("تم رفض العملية: يرجى التحقق من تفعيل Cloud Firestore وقواعد الحماية.");
        }
        if (error.code === "unavailable") {
            throw new Error("قاعدة البيانات غير متاحة حالياً. تحقق من اتصال الإنترنت.");
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

