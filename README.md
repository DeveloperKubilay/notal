# 📚 Notal - Akıllı Not Yönetim Sistemi

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.2-FFCA28?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

> Notlarını yönet, AI ile öğren, kendini test et 🚀

![](https://raw.githubusercontent.com/DeveloperKubilay/notal/refs/heads/main/imgs/1.png)
![](https://raw.githubusercontent.com/DeveloperKubilay/notal/refs/heads/main/imgs/2.png)
![](https://raw.githubusercontent.com/DeveloperKubilay/notal/refs/heads/main/imgs/3.png)

## ✨ Nedir Bu?

Notal, sıradan bir not uygulaması değil. Google Gemini AI entegrasyonuyla notlarını interaktif öğrenme materyaline dönüştüren, modern bir web uygulaması.

**Temel Özellikler:**
- 📁 **Klasör Yapısı**: Notlarını istediğin gibi organize et
- 🤖 **AI Chat**: Gemini AI ile sohbet et, görsel analizi yap
- 🧠 **Kendini Test Et**: AI destekli quiz sistemi
- 📊 **Plan Yönetimi**: Hedeflerini belirle, geri sayımı takip et
- 🔒 **Cevap Sansürleme**: Önce düşün, sonra kontrol et
- 📎 **Dosya Ekleme**: Resim, PDF, her şey
- ⚡ **Real-time Sync**: Her şey anlık güncelleniyor

## 🎥 Demo

[Buraya GIF veya ekran görüntüleri eklenebilir]

## 🛠️ Teknolojiler

**Frontend:**
- React 18.3 + Vite
- Tailwind CSS 4.1
- Framer Motion
- React Router Dom

**Backend & AI:**
- Firebase (Auth, Firestore, Storage)
- Google Gemini AI (Flash Latest)
- Real-time Database

**UI/UX:**
- Lucide Icons
- React Markdown
- Glassmorphism Design

## 🚀 Kurulum

### Gereksinimler
```bash
Node.js >= 18
npm veya yarn
```

### Adımlar

1. **Repoyu klonla:**
```bash
git clone https://github.com/DeveloperKubilay/notal.git
cd notal
```

2. **Paketleri yükle:**
```bash
npm install
```

3. **Environment dosyasını oluştur:**
```bash
cp .env.example .env.local
```

4. **API keylerini ekle** (`.env.local`):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

5. **Firebase projesi kur:**
   - [Firebase Console](https://console.firebase.google.com)'a git
   - Yeni proje oluştur
   - Authentication → Google ile giriş aktif et
   - Firestore Database oluştur
   - Storage aktif et
   - Web app ekle ve config'i kopyala

6. **Gemini API key al:**
   - [Google AI Studio](https://aistudio.google.com)'ya git
   - API key oluştur

7. **Çalıştır:**
```bash
npm run dev
```

## 📖 Kullanım

### Not Oluşturma
1. Sol taraftan klasöre sağ tık → "Yeni Not"
2. Soru-cevap formatında yaz
3. İstersen dosya ekle
4. Kaydet 💾

### AI Chat
1. Sağ üstteki "AI ile Konuş" butonuna tıkla
2. Soru sor veya görsel yükle
3. AI sana yardımcı olsun 🤖

### Kendini Test Et
1. Bir klasör seç
2. Sağ üstten "Kendini Dene"
3. Rastgele sorular gelsin
4. AI cevaplarını kontrol etsin ✅

### Plan Yönetimi
1. Üst bardaki "+" butonuna tıkla
2. Hedef ve tarih belirle
3. Geri sayımı izle 📅

## 📁 Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── layout/         # Sidebar, TopBar
│   ├── modals/         # Modal'lar
│   ├── notes/          # Not işlemleri
│   └── workspace/      # Workspace bileşenleri
├── contexts/           # Global state yönetimi
│   ├── AuthContext.jsx       # Kimlik doğrulama
│   └── WorkspaceProvider.jsx # Workspace logic
├── hooks/              # Custom hook'lar
├── lib/                # Firebase & AI config
├── pages/              # Sayfa bileşenleri
└── utils/              # Yardımcı fonksiyonlar
```

Detaylı yapı için: [PROJE-YAPISI.md](./PROJE-YAPISI.md)

## 🔒 Güvenlik

- Firebase Security Rules ile veri koruması
- Kullanıcı bazlı yetkilendirme
- Storage için erişim kontrolü
- Google OAuth 2.0

## 🎨 Özellikler

### ✅ Tamamlananlar
- Klasör ve not yönetimi
- AI chat entegrasyonu
- Quiz sistemi
- Plan yönetimi
- Dosya yükleme
- Real-time sync
- Responsive tasarım

### 🚧 Geliştiriliyor
- Not arama
- Tag sistemi
- İstatistikler
- Export/Import
- Offline destek (PWA)

## 📝 Lisans

MIT License - İstediğin gibi kullan 🎉

## 🤝 Katkıda Bulunma

Pull request'ler her zaman hoş karşılanır! 

1. Fork'la
2. Feature branch oluştur (`git checkout -b feature/amazing`)
3. Commit'le (`git commit -m 'feat: amazing feature'`)
4. Push'la (`git push origin feature/amazing`)
5. PR aç

## 📞 İletişim

**Developer:** Kubilay  
**GitHub:** [@DeveloperKubilay](https://github.com/DeveloperKubilay)

## 🙏 Teşekkürler

- [React](https://react.dev) - UI framework
- [Firebase](https://firebase.google.com) - Backend servisi
- [Google Gemini](https://ai.google.dev) - AI desteği
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - İkonlar

---

⭐ Beğendiysen star at, kod yazmaya devam 💪🔥