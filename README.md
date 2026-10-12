# OKR

Hedefleri (Objectives) ve anahtar sonuçları (Key Results) belirleyip takip etmek için basit bir web uygulaması.

**Teknoloji:** Next.js 15 (App Router, Server Actions) · Prisma · SQLite

## Özellikler (MVP)
- Dönem bazlı hedefler (ör. `2026-Q4`), açıklama, düzenleme ve silme
- Her hedefe ölçülebilir anahtar sonuçlar: başlangıç, hedef, mevcut değer, birim
  (düşüş hedefleri de desteklenir, ör. churn %5 → %3)
- İlerleme güncellemesi (check-in) ve not; son güncellemelerin geçmişi
- Otomatik ilerleme: KR = (mevcut − başlangıç) / (hedef − başlangıç), hedef = KR ortalaması
- Durum: ilerleme, dönemin geçen kısmıyla karşılaştırılır → Yolunda / Risk altında / Geride / Tamamlandı
- Gösterge paneli: dönem seçimi, genel ilerleme, durum sayıları, hedef listesi

## Kurulum
Node.js 20+ gerekir.

```bash
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
npm run setup     # veritabanını oluşturur (prisma migrate deploy)
npm run dev       # http://localhost:3000
```

Üretim için: `npm run build && npm start`.

## Sonraki adımlar (takım kullanımı)
- Kullanıcı girişi (Auth.js) ve `User` / `Team` modelleri; `Objective`'e `ownerId` / `teamId`
- Üst hedefe bağlama (şirket → takım → kişi hizalaması)
- Çok kullanıcılı kullanım için SQLite yerine PostgreSQL (`schema.prisma` içinde `provider` değişikliği)
