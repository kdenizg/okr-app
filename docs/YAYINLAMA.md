# Yayına alma rehberi (Neon + Vercel)

Uygulama artık PostgreSQL veritabanı ve giriş sistemiyle çalışıyor. Aşağıdaki adımlar Windows PowerShell içindir.
Şifreleri ve bağlantı adreslerini kimseyle paylaşmayın; yalnızca `.env` dosyasına ve Vercel ayarlarına yazın.

## 1. Veritabanı: Neon (ücretsiz)
1. https://neon.tech adresine gidin, **Sign up** ile (GitHub hesabınızla) kayıt olun.
2. **Create project** deyin. Ad: `okr`. Bölge: **AWS Europe Central 1 (Frankfurt)**. **Create** ile oluşturun.
3. Proje panosunda sağ üstteki **Connect** düğmesine basın.
4. **Connection pooling** anahtarı **açıkken** görünen adresi kopyalayın: bu `DATABASE_URL`.
5. Anahtarı **kapatın** ve görünen adresi kopyalayın: bu `DIRECT_URL`.
   (İkisinin farkı adreste `-pooler` kelimesidir.)

## 2. Bilgisayarınızda çalıştırma
Proje klasöründe PowerShell açın:

```powershell
git pull
Copy-Item .env.example .env
notepad .env
```

Not defterinde:
- `DATABASE_URL` ve `DIRECT_URL` satırlarına 1. adımdaki adresleri tırnak içinde yapıştırın.
- `AUTH_SECRET` için rastgele bir anahtar üretin. PowerShell'de şunu çalıştırıp çıkan satırı tırnak içine yapıştırın:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- Google girişi kullanmayacaksanız `AUTH_GOOGLE_*` satırlarını boş bırakın.

Kaydedip kapatın, sonra:

```powershell
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

http://localhost:3000 adresini açın, **Hesap oluşturun** bağlantısıyla kayıt olun.

> Not: Eski SQLite veritabanındaki (`prisma/dev.db`) hedefler yeni veritabanına taşınmaz.

## 3. İnternete yayınlama: Vercel (ücretsiz)
1. GitHub'daki pull request'i birleştirin (**Merge pull request**). Vercel `main` dalını yayınlar.
2. https://vercel.com adresinde **Sign up** → **Continue with GitHub**.
3. **Add New… → Project** deyin, listeden `okr-app` deposunu bulun ve **Import** deyin.
   (Depo görünmüyorsa **Adjust GitHub App Permissions** ile Vercel'e bu depoya erişim verin.)
4. **Environment Variables** bölümünü açın ve üç değişken ekleyin (değerler `.env` dosyanızdakiyle aynı):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
5. **Deploy** deyin. Bitince Vercel size `https://okr-app-xxxx.vercel.app` gibi bir adres verir.
   Kurulum sırasında veritabanı tabloları otomatik oluşturulur.

Bundan sonra `main` dalına gelen her değişiklik otomatik olarak yayınlanır.

## 4. (İsteğe bağlı) Google ile giriş
1. https://console.cloud.google.com adresinde yeni bir proje oluşturun.
2. **APIs & Services → OAuth consent screen**: **External** seçin, uygulama adı ve e-postanızı girip kaydedin.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs** kısmına iki adres ekleyin:
     - `https://SIZIN-ADRESINIZ.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
4. Çıkan **Client ID** ve **Client secret** değerlerini:
   - Vercel'de **Settings → Environment Variables** altına `AUTH_GOOGLE_ID` ve `AUTH_GOOGLE_SECRET` olarak ekleyin,
     sonra **Deployments** sekmesinde son yayının **⋯ → Redeploy** seçeneğine basın.
   - Yerelde kullanmak isterseniz `.env` dosyasına da yazın.

İki değer de tanımlı olduğunda giriş sayfasında **Google ile devam et** düğmesi görünür.
