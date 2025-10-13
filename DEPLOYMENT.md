# 🚀 Firebase Hosting Deployment Rehberi

## 📋 Ön Hazırlık

### 1. Firebase CLI Kurulumu
```bash
npm install -g firebase-tools
```

### 2. Firebase Login
```bash
firebase login
```
Tarayıcıda Google hesabınla giriş yap 🔐

---

## 🔧 İlk Kurulum (Sadece Bir Kere)

### 1. Firebase Projesi Oluştur
- [Firebase Console](https://console.firebase.google.com) git
- "Add project" tıkla
- İsim ver (örn: `notal-app`)
- Analytics istersen ekle

### 2. Firebase Initialize
```bash
firebase init hosting
```

**Sorular gelecek:**
- Select project: Mevcut projeyi seç veya yeni oluştur
- Public directory: **`dist`** yaz (Vite build folder)
- Single-page app: **`Yes`** seç
- GitHub auto deploy: İstersen evet

### 3. `.firebaserc` Düzenle
```json
{
  "projects": {
    "default": "senin-proje-id"
  }
}
```

---

## 📦 Build ve Deploy

### Standart Deploy (Production)

```bash
# 1. Build yap
npm run build

# 2. Deploy et
firebase deploy --only hosting
```

**Çıktı:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/notal-app/overview
Hosting URL: https://notal-app.web.app
```

---

## 🧪 Preview Channel (Test Ortamı)

Preview channel ile production'a dokunmadan test edebilirsin 💪

### Preview Deploy
```bash
# Build
npm run build

# Preview channel oluştur ve deploy et
firebase hosting:channel:deploy preview
```

**Çıktı:**
```
✔  Channel URL (preview): https://notal-app--preview-abc123.web.app
Expires: 30 days
```

### Custom Channel İsmi
```bash
firebase hosting:channel:deploy test-v2
firebase hosting:channel:deploy staging
firebase hosting:channel:deploy deneme
```

### Channel Listesi Göster
```bash
firebase hosting:channel:list
```

### Channel Sil
```bash
firebase hosting:channel:delete preview
```

---

## 🎯 Package.json Script'leri Ekle

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

**Kullanımı:**
```bash
npm run deploy           # Production deploy
npm run deploy:preview   # Preview deploy
```

---

## 🔑 Environment Variables Ekle

Firebase Hosting'de env variables yerel `.env` dosyasından gelir. 

### Production Build
```bash
# .env.local dosyan olmalı
npm run build
firebase deploy --only hosting
```

**Önemli:** `.env.local` dosyası Git'e commitlenmemeli! ⚠️

---

## 🌐 Custom Domain Bağlama

### 1. Firebase Console → Hosting → Add custom domain
### 2. Domain adını gir (örn: `notal.com`)
### 3. DNS kayıtlarını ekle:
```
Type: A
Name: @
Value: 151.101.1.195 (Firebase verir)

Type: A  
Name: @
Value: 151.101.65.195 (Firebase verir)
```

### 4. SSL otomatik aktif olur (Let's Encrypt) 🔒

---

## 📊 Deployment Kontrol

### Deployment Geçmişi
```bash
firebase hosting:releases:list
```

### Site Açık mı Kontrol
```bash
curl -I https://senin-site.web.app
```

### Analytics
Firebase Console → Analytics → Dashboard'a git

---

## 🐛 Sorun Giderme

### 1. "Permission Denied"
```bash
firebase login --reauth
```

### 2. "Project not found"
`.firebaserc` dosyasındaki proje ID'sini kontrol et

### 3. Build hataları
```bash
# Cache temizle
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

### 4. 404 Hataları
`firebase.json`'da rewrite kuralı olmalı:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 💡 Pro Tips

### Hızlı Deploy
```bash
npm run build && firebase deploy
```

### Sadece Firestore Rules Deploy
```bash
firebase deploy --only firestore:rules
```

### Sadece Storage Rules Deploy
```bash
firebase deploy --only storage
```

### Rollback (Geri Al)
Firebase Console → Hosting → Release History → Rollback butonuna tıkla

### Cache Temizleme
`firebase.json`'a header ekle:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

---

## 📱 Multi-Site Hosting

Birden fazla site aynı projede:

```bash
firebase target:apply hosting main notal-app
firebase target:apply hosting blog notal-blog

firebase deploy --only hosting:main
firebase deploy --only hosting:blog
```

---

## 🔄 GitHub Actions ile Otomatik Deploy

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## 📚 Kaynaklar

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

**Son Güncelleme:** 14 Ekim 2025  
**Yazar:** DeveloperKubilay

🔥 Deploy etmeye devam!
