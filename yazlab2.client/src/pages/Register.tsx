import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css"; // Login.css'i burada da kullanıyoruz (Tasarım bütünlüğü için)

// İkonlar
import { FaUser, FaLock, FaKey } from "react-icons/fa";
import { MdEmail, MdVerifiedUser } from "react-icons/md";
import { RiSendPlaneFill } from "react-icons/ri";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");

    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Genel yükleme
    const [isSendingCode, setIsSendingCode] = useState(false); // Kod gönderiliyor animasyonu

    const navigate = useNavigate();

    // Geri sayım mantığı
    useEffect(() => {
        let interval: any = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // 1. KOD GÖNDERME
    const handleSendCode = async () => {
        if (!email) { alert("Lütfen önce e-posta adresinizi girin."); return; }

        setIsSendingCode(true);
        try {
            await api.post("/api/auth/send-verification-code", { email });
            alert("Kod e-posta adresinize gönderildi!");
            setIsCodeSent(true);
            setTimer(60);
        } catch (err: any) {
            alert(err.response?.data || "Kod gönderilemedi.");
        } finally {
            setIsSendingCode(false);
        }
    };

    // 2. KAYIT İŞLEMİ
    const handleRegister = async (e: any) => {
        e.preventDefault();

        if (password !== confirmPassword) { alert("Şifreler eşleşmiyor!"); return; }
        if (!isCodeSent) { alert("Lütfen önce doğrulama kodunu alınız."); return; }

        setIsLoading(true);
        // Biraz yapay gecikme (Animasyon görünsün diye)
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            await api.post("/api/auth/register", {
                username,
                email,
                password,
                confirmPassword,
                verificationCode: code
            });

            // Başarılı olursa
            navigate("/login");
            alert("Kayıt Başarılı! Giriş yapabilirsiniz.");

        } catch (err: any) {
            let msg = "Hata oluştu";
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
            }
            alert("Kayıt Hatası: " + msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ width: "450px" }}> {/* Biraz daha geniş */}
                <h1 className="login-title">Aramıza Katıl</h1>

                <form onSubmit={handleRegister}>

                    {/* Kullanıcı Adı */}
                    <div className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Kullanıcı Adı"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* E-Posta ve Kod Gönder Butonu (Yan Yana) */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                        <div className="input-wrapper" style={{ flex: 1, marginBottom: 0 }}>
                            <MdEmail className="input-icon" />
                            <input
                                type="email"
                                className="modern-input"
                                placeholder="E-posta"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={timer > 0 || isSendingCode}
                            className="login-btn"
                            style={{
                                width: "auto",
                                margin: 0,
                                padding: "0 15px",
                                height: "50px",
                                fontSize: "14px",
                                borderRadius: "15px",
                                background: timer > 0 ? "#6c757d" : "linear-gradient(90deg, #1CB5E0 0%, #000851 100%)"
                            }}
                        >
                            {isSendingCode ? <div className="spinner" style={{ width: "15px", height: "15px" }}></div> : (
                                timer > 0 ? `${timer}s` : <><RiSendPlaneFill size={20} /></>
                            )}
                        </button>
                    </div>

                    {/* Doğrulama Kodu (Sadece kod gönderilince açılır) */}
                    {isCodeSent && (
                        <div className="input-wrapper" style={{ animation: "fadeIn 0.5s" }}>
                            <FaKey className="input-icon" style={{ color: "#4CAF50" }} />
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="5 Haneli Kod"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                maxLength={5}
                                style={{ border: "2px solid #4CAF50", textAlign: "center", letterSpacing: "5px", fontWeight: "bold" }}
                            />
                        </div>
                    )}

                    {/* Şifre */}
                    <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Şifre Tekrar */}
                    <div className="input-wrapper">
                        <MdVerifiedUser className="input-icon" />
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Şifre Tekrar"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Kayıt Ol Butonu */}
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Kayıt Ol"}
                    </button>

                </form>

                <div className="link-text">
                    Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;