# OKR

Hedefleri (Objectives) ve anahtar sonuçları (Key Results) belirleyip takip etmek için basit bir web uygulaması.

**Teknoloji:** Next.js 15 (App Router, Server Actions) · Prisma · PostgreSQL · Auth.js

## Özellikler (MVP)
- E-posta + şifre ile kayıt ve giriş, isteğe bağlı Google ile giriş; herkes yalnızca kendi hedeflerini görür
- Dönem bazlı hedefler (ör. `2026-Q4`), açıklama, düzenleme ve silme
- Her hedefe ölçülebilir anahtar sonuçlar: başlangıç, hedef, mevcut değer, birim
  (düşüş hedefleri de desteklenir, ör. churn %5 → %3)
- İlerleme güncellemesi (check-in) ve not; son güncellemelerin geçmişi
- Otomatik ilerleme: KR = (mevcut − başlangıç) / (hedef − başlangıç), hedef = KR ortalaması
- Durum: ilerleme, dönemin geçen kısmıyla karşılaştırılır → Yolunda / Risk altında / Geride / Tamamlandı
- Gösterge paneli: dönem seçimi, genel ilerleme, durum sayıları, hedef listesi

## Kurulum
Node.js 20+ ve bir PostgreSQL veritabanı (ör. ücretsiz Neon) gerekir.
Adım adım anlatım, Vercel'de yayınlama ve Google girişi için: [docs/YAYINLAMA.md](docs/YAYINLAMA.md).

```bash
npm install
cp .env.example .env   # DATABASE_URL, DIRECT_URL ve AUTH_SECRET değerlerini doldurun
npm run setup          # tabloları oluşturur (prisma migrate deploy)
npm run dev            # http://localhost:3000
```

Üretim için: `npm run build && npm start` (build, bekleyen migration'ları da uygular).

## Sonraki adımlar (takım kullanımı)
- `Team` / `Membership` modelleri ve davet; `Objective`'e isteğe bağlı `teamId`
- Üst hedefe bağlama (şirket → takım → kişi hizalaması)
