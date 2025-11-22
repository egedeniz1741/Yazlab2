import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css"; 


import { FaLock, FaKey } from "react-icons/fa";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false); 

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmNewPassword) {
            setError("Şifreler uyuşmuyor.");
            return;
        }

        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            await api.post("/api/auth/reset-password", {
                token, email, newPassword, confirmNewPassword
            });
            alert("Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.");
            navigate("/login");
        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(typeof err.response.data === "string" ? err.response.data : "Bağlantı hatası.");
            } else {
                setError("Hata: Link geçersiz veya süresi dolmuş.");
            }
        } finally {
            setIsLoading(false);
        }
    };

  
    if (!token || !email) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title" style={{ fontSize: "24px" }}>Geçersiz Bağlantı ⚠️</h2>
                    <p style={{ marginBottom: "20px" }}>Bu şifre sıfırlama linki eksik veya hatalı.</p>
                    <Link to="/login">
                        <button className="login-btn">Giriş Sayfasına Dön</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Yeni Şifre Belirle</h1>
                <p style={{ marginBottom: "25px", fontSize: "14px", opacity: 0.8 }}>
                    Lütfen hesabınız için yeni ve güvenli bir şifre giriniz.
                </p>

                <form onSubmit={handleSubmit}>

                 
                    <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Yeni Şifre"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

              
                    <div className="input-wrapper">
                        <FaKey className="input-icon" />
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Yeni Şifre Tekrar"
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>

                 
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Şifreyi Değiştir"}
                    </button>
                </form>

             
                {error && <div className="error-msg">⚠️ {error}</div>}

                <div className="link-text">
                    <Link to="/login">Giriş Sayfasına Dön</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;