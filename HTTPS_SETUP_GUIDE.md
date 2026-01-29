# دليل تفعيل HTTPS في الإنتاج
## HTTPS Setup Guide

**تاريخ:** 2025-01-28

---

## 📋 نظرة عامة

HTTPS (HyperText Transfer Protocol Secure) يشفّر الاتصال بين المتصفح والسيرفر، مما يحمي البيانات من الاعتراض.

---

## 🎯 الطرق المتاحة

### 1. ✅ **Nginx Reverse Proxy** (موصى به - الأفضل)
- الأكثر استقراراً وأداءً
- يدير SSL/TLS بشكل احترافي
- يدعم HTTP/2
- مناسب للسيرفرات الخاصة (VPS/Dedicated)

### 2. ✅ **Cloudflare** (أسهل - مجاني)
- مجاني 100%
- CDN + SSL مجاني
- حماية DDoS
- مناسب للجميع

### 3. ⚠️ **Node.js مباشرة** (غير موصى به)
- يمكن لكنه ليس الأفضل
- يحتاج إدارة شهادات SSL يدوياً
- لا يدعم HTTP/2 بشكل جيد

---

## 🚀 الطريقة 1: Nginx Reverse Proxy (موصى به)

### الخطوة 1: تثبيت Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
# أو
sudo dnf install nginx
```

### الخطوة 2: تثبيت Certbot (Let's Encrypt)

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### الخطوة 3: إعداد Nginx

أنشئ ملف إعداد لموقعك:

```bash
sudo nano /etc/nginx/sites-available/reviewqeem
```

**محتويات الملف:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (سيتم إضافتها تلقائياً بواسطة Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:8093;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        proxy_pass http://127.0.0.1:8093;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### الخطوة 4: تفعيل الموقع

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/reviewqeem /etc/nginx/sites-enabled/

# اختبار الإعداد
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### الخطوة 5: الحصول على شهادة SSL

```bash
# الحصول على شهادة SSL مجانية من Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# اتبع التعليمات على الشاشة
# Certbot سيقوم تلقائياً بـ:
# 1. الحصول على الشهادة
# 2. تحديث إعدادات Nginx
# 3. إعداد التجديد التلقائي
```

### الخطوة 6: تحديث متغيرات البيئة

في ملف `.env`:

```env
NODE_ENV=production
PORT=8093
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### الخطوة 7: تحديث server.js

تأكد من أن الكود موجود (موجود بالفعل):

```javascript
// HTTPS Enforcement
if (!isDevelopment) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### الخطوة 8: إعادة تشغيل التطبيق

```bash
# إذا كنت تستخدم PM2
pm2 restart reviewqeem

# أو إذا كنت تستخدم systemd
sudo systemctl restart reviewqeem
```

---

## 🌐 الطريقة 2: Cloudflare (أسهل - مجاني)

### الخطوة 1: إنشاء حساب في Cloudflare

1. اذهب إلى [cloudflare.com](https://cloudflare.com)
2. أنشئ حساب مجاني
3. أضف موقعك (domain)

### الخطوة 2: تغيير DNS

1. Cloudflare سيعطيك nameservers
2. اذهب إلى مسجل النطاق (Domain Registrar)
3. غيّر nameservers إلى التي أعطاكها Cloudflare

### الخطوة 3: تفعيل SSL

1. في لوحة Cloudflare، اذهب إلى **SSL/TLS**
2. اختر **Full** أو **Full (strict)**
3. SSL سيتم تفعيله تلقائياً

### الخطوة 4: تحديث متغيرات البيئة

```env
NODE_ENV=production
PORT=8093
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### الخطوة 5: إعداد Nginx (اختياري لكن موصى به)

إذا كنت تستخدم Nginx مع Cloudflare:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL من Cloudflare (أو Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:8093;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ الطريقة 3: Node.js مباشرة (غير موصى به)

إذا كنت تريد استخدام HTTPS مباشرة في Node.js:

### الخطوة 1: الحصول على شهادة SSL

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

### الخطوة 2: تحديث server.js

```javascript
const https = require('https');
const fs = require('fs');

// في الإنتاج فقط
if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
  };

  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

  // Redirect HTTP to HTTPS
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

---

## 🔄 تجديد شهادة SSL تلقائياً

Let's Encrypt شهادات تنتهي بعد 90 يوم. Certbot يضيف cron job تلقائياً:

```bash
# التحقق من cron job
sudo certbot renew --dry-run

# أو يدوياً
sudo certbot renew
```

---

## ✅ التحقق من HTTPS

بعد التفعيل، تحقق من:

1. **فتح الموقع:** `https://yourdomain.com`
2. **التحقق من الشهادة:** اضغط على 🔒 في المتصفح
3. **اختبار SSL:** [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## 🛠️ استكشاف الأخطاء

### المشكلة: "502 Bad Gateway"
**الحل:** تأكد أن Node.js يعمل على المنفذ 8093

### المشكلة: "SSL certificate error"
**الحل:** 
- تحقق من أن الشهادة صحيحة
- تأكد من تحديث DNS
- انتظر 24 ساعة بعد تغيير DNS

### المشكلة: "Mixed Content"
**الحل:** تأكد أن جميع الروابط تستخدم HTTPS

---

## 📝 ملاحظات مهمة

1. **Nginx هو الأفضل** للإنتاج - أداء أفضل واستقرار أعلى
2. **Cloudflare أسهل** - مجاني ويوفر CDN أيضاً
3. **Node.js مباشرة** - غير موصى به للإنتاج
4. **تأكد من تحديث `ALLOWED_ORIGINS`** في `.env`
5. **اختبر HTTPS** قبل النشر

---

## 🎯 التوصية النهائية

**للسيرفرات الخاصة (VPS/Dedicated):**
- استخدم **Nginx + Let's Encrypt**

**للمبتدئين أو المواقع الصغيرة:**
- استخدم **Cloudflare** (أسهل وأسرع)

---

**نهاية الدليل**
