# 🔐 نظام المصادقة الكامل لـ WinGrid

## نظرة عامة

هذا المستند يوضح نظام المصادقة الكامل المطبق في WinGrid، بما فيه:
- تسجيل المستخدمين الجدد (Register)
- تسجيل الدخول (Login)
- تسجيل دخول المسؤول (Admin Login)
- التحقق من صحة البيانات (Validation)
- إدارة الجلسات (Session Management)

---

## 1. تسجيل المستخدم الجديد (Registration)

### المتطلبات:
- ✅ البريد الإلكتروني: يجب أن يكون صيغة بريد صحيحة
- ✅ الاسم الكامل: 3-100 حرف
- ✅ رقم الهاتف: رقم سعودي بصيغة صحيحة
- ✅ كلمة المرور: يجب أن تحتوي على:
  - 8 أحرف على الأقل
  - حرف كبير واحد (A-Z)
  - حرف صغير واحد (a-z)
  - رقم واحد (0-9)
  - رمز خاص واحد (!@#$%^&*)

### الخطوات:

1. المستخدم ينقر على "إنشاء حساب جديد"
2. يملأ النموذج بالبيانات المطلوبة
3. يتم التحقق من جميع الحقول
4. إذا كانت البيانات صحيحة:
   - ينشئ حساب Supabase Auth
   - تُضاف بيانات الملف الشخصي إلى جدول `users`
   - يُرسل بريد تأكيد للمستخدم
5. المستخدم يأكد البريد ويمكنه تسجيل الدخول

### مثال API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!",
    "fullName": "محمد أحمد",
    "phone": "05XXXXXXXX"
  }'
```

### الأخطاء المحتملة:

| الخطأ | السبب | الحل |
|------|------|-----|
| `MISSING_FIELDS` | حقل مفقود | أكمل جميع الحقول |
| `INVALID_EMAIL` | صيغة بريد خاطئة | أدخل بريد صحيح |
| `INVALID_NAME` | الاسم قصير جداً | أدخل اسم 3 أحرف على الأقل |
| `INVALID_PHONE` | رقم هاتف خاطئ | أدخل رقم سعودي صحيح |
| `WEAK_PASSWORD` | كلمة مرور ضعيفة | اتبع متطلبات الأمان |
| `PASSWORD_MISMATCH` | كلمات المرور غير متطابقة | تأكد من تطابق كلمات المرور |
| `EMAIL_EXISTS` | البريد مسجل بالفعل | استخدم بريد آخر |

---

## 2. تسجيل الدخول (Login)

### المتطلبات:
- ✅ البريد الإلكتروني
- ✅ كلمة المرور

### الخطوات:

1. المستخدم ينقر على "تسجيل الدخول"
2. يدخل البريد الإلكتروني وكلمة المرور
3. يتم التحقق من البيانات
4. إذا كانت صحيحة:
   - يُنشئ جلسة
   - تُخزن بيانات المستخدم في Store
   - يُنقل إلى لوحة التحكم
5. إذا كانت خاطئة: يُعرض رسالة خطأ

### مثال API:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### الأخطاء المحتملة:

| الخطأ | السبب |
|------|-------|
| `MISSING_FIELDS` | حقل مفقود |
| `INVALID_EMAIL` | صيغة بريد خاطئة |
| `INVALID_CREDENTIALS` | البريد أو كلمة المرور غير صحيحة |

---

## 3. تسجيل دخول المسؤول (Admin Login)

### المتطلبات:
- ✅ كلمة المرور الرئيسية فقط

### الخطوات:

1. المسؤول ينقر على "دخول الإدارة"
2. يدخل كلمة المرور الرئيسية
3. يتم التحقق من كلمة المرور
4. إذا كانت صحيحة:
   - يُنشئ token في localStorage
   - يُحفظ وقت تسجيل الدخول
   - يُنقل إلى لوحة التحكم
5. الجلسة تنتهي بعد 24 ساعة تلقائياً

### مثال API:

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your_admin_password"
  }'
```

---

## 4. التحقق من الصحة (Validation)

### قواعد البريد الإلكتروني:
- يجب أن يحتوي على `@` و `.`
- صيغة: `name@domain.com`

### قواعد الاسم الكامل:
- 3-100 حرف
- يسمح بالأحرف العربية والإنجليزية والأرقام والمسافات

### قواعل رقم الهاتف:
- يجب أن يكون رقم سعودي
- الأشكال المقبولة:
  - `05XXXXXXXX`
  - `0565123456`
  - `+966565123456`
  - `966565123456`

### قواعد كلمة المرور:

```
✓ 8 أحرف على الأقل
✓ حرف كبير (A-Z)
✓ حرف صغير (a-z)
✓ رقم (0-9)
✓ رمز خاص (!@#$%^&*)

مثال على كلمة مرور قوية:
SecurePass123!
```

---

## 5. إدارة الجلسات

### Supabase Auth:
- يتم تخزين access token في `sb-access-token`
- مدة صلاحية الـ token: 60 دقيقة
- يتم تحديث الـ token تلقائياً عند انتهائه

### Admin Session:
- يتم تخزين token في localStorage
- مدة صلاحية الجلسة: 24 ساعة
- يتم حذف الـ token تلقائياً بعد 24 ساعة

### الحماية:

```typescript
// التحقق من جلسة المسؤول
if (!isAdminLoggedIn()) {
  redirect('/admin/login')
}

// التحقق من جلسة المستخدم
const user = await getCurrentUser()
if (!user) {
  redirect('/auth/login')
}
```

---

## 6. تسجيل الخروج

### الخطوات:

1. المستخدم ينقر على "تسجيل الخروج"
2. يتم حذف جلسة Supabase Auth
3. يتم حذف admin tokens من localStorage
4. يُنقل إلى صفحة تسجيل الدخول

### مثال API:

```bash
curl -X POST http://localhost:3000/api/auth/logout
```

---

## 7. معالجة الأخطاء

جميع الأخطاء توفر:
- `message`: رسالة الخطأ بالعربية
- `code`: كود الخطأ (للبرمجيين)
- `status`: حالة الـ HTTP

### مثال:

```json
{
  "success": false,
  "error": "كلمة المرور غير صحيحة",
  "code": "INVALID_CREDENTIALS"
}
```

---

## 8. الأمان والخصوصية

✅ **تشفير كامل:**
- جميع البيانات مشفرة أثناء النقل (HTTPS)
- كلمات المرور لا تُخزن بشكل نصي

✅ **Row Level Security (RLS):**
- المستخدم يرى بيانات نفسه فقط
- المسؤول يمكنه الوصول إلى جميع البيانات

✅ **التحقق من الهوية:**
- تأكيد البريد الإلكتروني قبل تفعيل الحساب
- كلمات مرور قوية مطلوبة

✅ **جلسات آمنة:**
- انتهاء الجلسة بعد فترة زمنية
- حذف الـ tokens عند تسجيل الخروج

---

## 9. الاختبار

### اختبار تسجيل مستخدم جديد:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "passwordConfirm": "TestPass123!",
    "fullName": "محمد احمد",
    "phone": "0512345678"
  }'
```

### اختبار تسجيل الدخول:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### اختبار تسجيل دخول المسؤول:

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your_admin_password"
  }'
```

---

## 10. الموارد الإضافية

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Best Practices for Password Security](https://owasp.org/www-community/controls/Password_strong_enough)
- [Email Validation Standards](https://www.w3.org/TR/html5/forms.html#valid-e-mail-address)

---
