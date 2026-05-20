# إعداد و تشغيل تطبيق الموبايل (WinGrid Mobile)

هذا الدليل يشرح كيفية تشغيل تطبيق الجوال المبني باستخدام Expo وربطه بمشروع Supabase الموجود.

## المتطلبات
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`) أو استخدام EAS
- حساب Supabase

## خطوات الإعداد
1. افتح مجلد `mobile`:

```bash
cd mobile
npm install
```

2. انسخ ملف البيئة:

```bash
cp .env.example .env
```

3. ضع مفاتيح Supabase في `.env` أو في `app.json` تحت `extra`:

```json
{
  "expo": {
    "extra": {
      "SUPABASE_URL": "your_url",
      "SUPABASE_ANON_KEY": "your_anon_key"
    }
  }
}
```

4. تشغيل التطبيق محلياً:

```bash
npm run start
# أو
expo start
```

5. لبناء APK/IPA استخدم EAS:

```bash
eas build --platform android
eas build --platform ios
```

---

# ملاحظات
- تطبيق الموبايل يستخدم Supabase للقراءة والكتابة. تأكد من سياسات RLS وملفات التخزين (`wingrid-receipts`) معدة بشكل صحيح.
- واجهات الموبايل مبسطة لتبدأ بها. سنربط مزيداً من الوظائف (المصادقة، الدفع داخل التطبيق) في المرحلة التالية.
