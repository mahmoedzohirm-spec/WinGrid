# Phase C: Advanced Reporting System - API Documentation

## 📊 نظام التقارير المتقدمة

### نظرة عامة
تم إضافة نظام تقارير شامل يوفر رؤية عميقة حول جميع جوانب النظام من طلبات وأرباح وفائزين ونشاط المستخدمين.

---

## 🔌 Endpoints

### 1. تقرير الطلبات
**GET** `/api/reports/orders`

#### Query Parameters:
- `fromDate` (optional): بداية التاريخ (ISO 8601)
- `toDate` (optional): نهاية التاريخ (ISO 8601)
- `status` (optional): حالة الطلب (pending, completed, cancelled)

#### Response:
```json
{
  "success": true,
  "summary": {
    "total": 150,
    "completed": 120,
    "pending": 20,
    "cancelled": 10,
    "totalAmount": 45000,
    "completionRate": "80.00"
  },
  "orders": [
    {
      "id": "order_123",
      "user_id": "user_456",
      "status": "completed",
      "total_amount": 300,
      "created_at": "2026-05-25T10:00:00Z"
    }
  ],
  "generatedAt": "2026-05-25T13:45:00Z"
}
```

---

### 2. تقرير المدفوعات
**GET** `/api/reports/payments`

#### Query Parameters:
- `fromDate` (optional): بداية التاريخ
- `toDate` (optional): نهاية التاريخ
- `status` (optional): حالة الدفع (success, failed, pending)
- `method` (optional): طريقة الدفع (stripe, etc)

#### Response:
```json
{
  "success": true,
  "summary": {
    "total": 150,
    "successful": 145,
    "failed": 3,
    "pending": 2,
    "totalAmount": 450000,
    "successRate": "96.67",
    "averageAmount": "3103.45"
  },
  "payments": [
    {
      "id": "payment_123",
      "user_id": "user_456",
      "amount": 300,
      "status": "success",
      "payment_method": "stripe",
      "created_at": "2026-05-25T10:00:00Z"
    }
  ],
  "generatedAt": "2026-05-25T13:45:00Z"
}
```

---

### 3. تقرير الفائزين
**GET** `/api/reports/winners`

#### Response:
```json
{
  "success": true,
  "summary": {
    "totalWinners": 50,
    "lotteries": 5,
    "totalPrizeAmount": 100000,
    "averagePrizePerWinner": "2000.00"
  },
  "winners": [
    {
      "id": "winner_123",
      "user_id": "user_456",
      "lottery_id": "lottery_789",
      "prize_amount": 5000,
      "user": {
        "id": "user_456",
        "email": "user@example.com",
        "full_name": "Ahmed Mohamed"
      },
      "lottery": {
        "id": "lottery_789",
        "name": "Draw #1",
        "prize": 5000
      }
    }
  ],
  "generatedAt": "2026-05-25T13:45:00Z"
}
```

---

### 4. تقرير نشاط المستخدمين
**GET** `/api/reports/users`

#### Response:
```json
{
  "success": true,
  "summary": {
    "totalUsers": 500,
    "admins": 5,
    "players": 495,
    "activeUsers": 380,
    "inactiveUsers": 120,
    "totalOrders": 1200,
    "averageOrdersPerUser": "2.40"
  },
  "users": [
    {
      "id": "user_456",
      "email": "user@example.com",
      "full_name": "Ahmed Mohamed",
      "role": "player",
      "created_at": "2026-01-15T09:00:00Z",
      "ordersCount": 5,
      "lastOrderDate": "2026-05-20T14:30:00Z"
    }
  ],
  "generatedAt": "2026-05-25T13:45:00Z"
}
```

---

### 5. التقرير الشامل
**GET** `/api/reports/comprehensive`

يجمع جميع التقارير في استدعاء واحد.

#### Response:
```json
{
  "success": true,
  "data": {
    "orders": { /* تقرير الطلبات */ },
    "payments": { /* تقرير المدفوعات */ },
    "winners": { /* تقرير الفائزين */ },
    "users": { /* تقرير المستخدمين */ }
  },
  "generatedAt": "2026-05-25T13:45:00Z"
}
```

---

### 6. تصدير الطلبات إلى CSV
**GET** `/api/reports/orders/export/csv`

#### Query Parameters:
- نفس parameters تقرير الطلبات

#### Response:
ملف CSV يحتوي على جميع بيانات الطلبات المطابقة.

---

## 🔒 المصادقة والصلاحيات

جميع endpoints تتطلب:
- ✅ المصادقة (Bearer Token)
- ✅ صلاحيات المشرف (Admin Role)

#### مثال الطلب:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api.com/api/reports/orders?status=completed
```

---

## 📱 واجهات المستخدم

### Admin Dashboard (React)
- تبويب جديد "التقارير" مع رسوم بيانية
- فلاتر تفاعلية للبيانات
- جداول تفصيلية للبيانات
- زر تصدير CSV

### Mobile App (React Native)
- شاشة "Reports" بملخص أساسي
- عرض الأرقام الرئيسية
- تحديث البيانات يدويًا

---

## 🛠️ أمثلة الاستخدام

### JavaScript/TypeScript (Frontend)
```typescript
// جلب تقرير الطلبات
const ordersReport = await fetch(
  '/api/reports/orders?status=completed&fromDate=2026-05-01'
).then(r => r.json());

console.log(`إجمالي الطلبات المكتملة: ${ordersReport.summary.completed}`);
```

### cURL
```bash
# تقرير الطلبات
curl -X GET "https://your-api.com/api/reports/orders" \
  -H "Authorization: Bearer TOKEN"

# تصدير CSV
curl -X GET "https://your-api.com/api/reports/orders/export/csv" \
  -H "Authorization: Bearer TOKEN" \
  -o orders.csv
```

---

## ⚙️ الملفات المضافة

### Backend
- `src/services/reporting.ts` - منطق التقارير
- `src/routes/reports.ts` - API Endpoints

### Frontend (Admin)
- `admin/src/components/ReportsDashboard.tsx` - لوحة التحكم الرسومية

### Mobile
- `mobile/src/screens/ReportsScreen.tsx` - شاشة ملخص التقارير

---

## 📊 الإحصائيات المدعومة

### تقارير الطلبات:
- ✅ العدد الإجمالي
- ✅ حسب الحالة (مكتملة، قيد الانتظار، ملغاة)
- ✅ نسبة الإكمال
- ✅ الإجمالي المالي

### تقارير المدفوعات:
- ✅ العدد الإجمالي
- ✅ حسب الحالة (ناجحة، فاشلة، قيد الانتظار)
- ✅ نسبة النجاح
- ✅ الإجمالي المالي
- ✅ متوسط المبلغ

### تقارير الفائزين:
- ✅ إجمالي الفائزين
- ✅ عدد السحبات
- ✅ إجمالي الجوائز
- ✅ متوسط الجائزة

### تقارير المستخدمين:
- ✅ إجمالي المستخدمين
- ✅ تقسيم حسب الدور (مشرف/لاعب)
- ✅ المستخدمون النشطون
- ✅ متوسط الطلبات لكل مستخدم

---

## 🚀 المميزات المستقبلية

- 📈 رسوم بيانية متقدمة (Heatmaps, Trends)
- 📧 إرسال التقارير عبر البريد الإلكتروني
- 📊 جدولة التقارير التلقائية
- 🔔 تنبيهات عند تحقق شروط معينة
- 📥 استيراد البيانات من مصادر خارجية

---

**التاريخ:** 2026-05-25  
**الإصدار:** 1.0.0  
**الحالة:** ✅ منتج
