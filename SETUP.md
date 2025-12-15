# دليل التشغيل السريع - Bamboo Proxy

## الخطوات (5 دقائق)

### 1️⃣ إنشاء حساب على Railway
- اذهب إلى: **https://railway.app**
- سجل دخول بحساب GitHub (مجاناً)

---

### 2️⃣ رفع الـ Proxy على Railway

**الطريقة الأسهل: من GitHub**

1. أنشئ repository جديد على GitHub
2. ارفع مجلد `bamboo-proxy` كامل
3. في Railway:
   - اضغط **"New Project"**
   - اختر **"Deploy from GitHub repo"**
   - اختر الـ repository
   - Railway راح يكتشف ويشغل تلقائياً ✅

**أو باستخدام Railway CLI:**
```bash
cd bamboo-proxy
npm install -g @railway/cli
railway login
railway init
railway up
```

---

### 3️⃣ الحصول على رابط الـ Proxy

بعد ما ينتهي الـ deployment:
1. في Railway Dashboard
2. اذهب إلى **Settings → Networking**
3. اضغط **"Generate Domain"**
4. راح تحصل على URL مثل:
   ```
   https://bamboo-proxy-production.up.railway.app
   ```

---

### 4️⃣ الحصول على Static IP

**من Terminal:**
```bash
nslookup bamboo-proxy-production.up.railway.app
```

أو
```bash
ping bamboo-proxy-production.up.railway.app
```

راح تحصل على IP Address مثل: `35.123.45.67`

**هذا الـ IP أرسله لـ Bamboo للقائمة البيضاء! ✅**

---

### 5️⃣ تحديث إعدادات المشروع

أضف الـ URL في ملف `.env`:
```env
BAMBOO_PROXY_URL=https://bamboo-proxy-production.up.railway.app
```

---

### 6️⃣ تحديث الـ Edge Function

في ملف `bamboo-catalog/index.ts`، سطر 101:

**قبل:**
```typescript
const catalogUrl = supplier.api_url;
```

**بعد:**
```typescript
const proxyUrl = Deno.env.get("BAMBOO_PROXY_URL");
const catalogUrl = proxyUrl
  ? `${proxyUrl}/bamboo/catalog`
  : supplier.api_url;
```

وفي سطر 104، أضف الـ Authorization header:
```typescript
const response = await fetch(catalogUrl, {
  method: "GET",
  headers: {
    "Authorization": proxyUrl ? `Basic ${bambooAuth}` : `Basic ${bambooAuth}`,
    "Content-Type": "application/json",
  },
});
```

---

## ✅ اختبار

**1. تحقق إن الـ Proxy شغال:**
```bash
curl https://your-proxy-url.up.railway.app/
```

يجب أن يرجع:
```json
{
  "status": "Bamboo Proxy is running",
  "timestamp": "2025-12-15T..."
}
```

**2. اختبر من Dashboard:**
- ادخل على لوحة التحكم
- اذهب لقسم الموردين
- جرب جلب الكتالوج

---

## 📝 ملاحظات مهمة

- ✅ Railway المجاني: **500 ساعة/شهر**
- ⚠️ هذا حل **مؤقت للتجربة**
- 🔒 للـ production: خذ خطة مدفوعة أو استخدم VPS

---

## 🆘 حل المشاكل

**Proxy لا يشتغل؟**
- تحقق من الـ logs في Railway Dashboard
- تأكد إن الـ PORT env variable موجود

**IP يتغير؟**
- Railway عادة ما يغير الـ IP
- لكن لو تغير، استخدم الأمر `nslookup` مرة ثانية

**502 Bad Gateway؟**
- انتظر دقيقة (الـ cold start)
- تحقق من الـ logs

---

## 🚀 بدائل (لو ما اشتغل Railway)

### Render.com
- https://render.com
- نفس الخطوات
- Deploy من GitHub

### Fly.io
- https://fly.io
- يعطي dedicated IPv4
- محتاج CLI
