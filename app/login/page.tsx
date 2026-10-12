import Link from "next/link";
import { googleEnabled } from "../../auth";
import { login, loginWithGoogle, register } from "../auth-actions";

const errors: Record<string, string> = {
  credentials: "E-posta veya şifre hatalı.",
  email: "Geçerli bir e-posta adresi girin.",
  password: "Şifre en az 8 karakter olmalı.",
  exists: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; error?: string }> }) {
  const sp = await searchParams;
  const isRegister = sp.mode === "register";
  const error = sp.error ? errors[sp.error] ?? "Giriş yapılamadı, tekrar deneyin." : null;

  return (
    <div className="auth">
      <h1>{isRegister ? "Hesap oluştur" : "Giriş yap"}</h1>
      {error && <p className="alert">{error}</p>}

      {googleEnabled && (
        <>
          <form action={loginWithGoogle}>
            <button className="btn secondary wide" type="submit">Google ile devam et</button>
          </form>
          <div className="divider"><span>veya</span></div>
        </>
      )}

      <form action={isRegister ? register : login} className="form">
        {isRegister && <label>Ad <span className="muted">(isteğe bağlı)</span><input name="name" autoComplete="name" /></label>}
        <label>E-posta<input name="email" type="email" required autoComplete="email" autoFocus /></label>
        <label>Şifre
          <input name="password" type="password" required minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? "new-password" : "current-password"} />
        </label>
        <button className="btn wide" type="submit">{isRegister ? "Hesap oluştur" : "Giriş yap"}</button>
      </form>

      <p className="muted">
        {isRegister
          ? <>Zaten hesabınız var mı? <Link href="/login" className="a">Giriş yapın</Link></>
          : <>Hesabınız yok mu? <Link href="/login?mode=register" className="a">Hesap oluşturun</Link></>}
      </p>
    </div>
  );
}
