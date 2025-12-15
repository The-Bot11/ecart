# Bamboo API Proxy

حل مؤقت للحصول على static IP للاتصال بـ Bamboo API.

## خطوات التشغيل على Railway

### 1. إنشاء حساب على Railway
- اذهب إلى: https://railway.app
- سجل دخول بحساب GitHub

### 2. رفع المشروع
```bash
# في مجلد bamboo-proxy
npm install
```

### 3. Deploy على Railway

**الطريقة الأولى: من GitHub**
1. ارفع هذا المجلد على GitHub repository منفصل
2. في Railway: New Project → Deploy from GitHub repo
3. اختر الـ repository
4. Railway راح يكتشف ويشغل المشروع تلقائياً

**الطريقة الثانية: Railway CLI**
```bash
# تثبيت Railway CLI
npm i -g @railway/cli

# تسجيل الدخول
railway login

# إنشاء مشروع جديد
railway init

# رفع المشروع
railway up
```

### 4. الحصول على Static IP

بعد ما يشتغل المشروع:
1. في Railway Dashboard → اختر المشروع
2. Settings → Networking → Generate Domain
3. راح تحصل على URL مثل: `https://bamboo-proxy-production.up.railway.app`
4. استخدم أمر `nslookup` أو `ping` عشان تحصل على IP:
   ```bash
   nslookup your-app.up.railway.app
   ```

### 5. تحديث Edge Function

استخدم الـ proxy في Edge Function:

```typescript
// بدل من:
const response = await fetch('https://api.bamboora.com/catalog', options);

// استخدم:
const response = await fetch('https://your-proxy.up.railway.app/bamboo/catalog', options);
```

## الاستخدام

**Endpoint Pattern:**
```
https://your-proxy.up.railway.app/bamboo/{bamboo-endpoint}
```

**مثال:**
- Bamboo API: `https://api.bamboora.com/catalog`
- Via Proxy: `https://your-proxy.up.railway.app/bamboo/catalog`

## بدائل Railway

### Render.com (مجاني)
- https://render.com
- يعطي static IP أيضاً
- Deploy مباشر من GitHub

### Fly.io (مجاني للبداية)
- https://fly.io
- يعطي dedicated IPv4

## ملاحظات مهمة

⚠️ **هذا حل مؤقت للتجربة فقط!**

- Railway المجاني محدود (500 ساعة/شهر)
- لو تبي production، خذ خطة مدفوعة أو استخدم VPS

## Health Check

تحقق إن الـ proxy شغال:
```bash
curl https://your-proxy.up.railway.app/
```

يرجع:
```json
{
  "status": "Bamboo Proxy is running",
  "timestamp": "2025-12-15T..."
}
```
