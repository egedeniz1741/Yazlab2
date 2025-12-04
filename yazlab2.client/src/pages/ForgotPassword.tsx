import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";


import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const response = await api.post("/api/auth/forgot-password", { email });
            setMessage(response.data);

        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(typeof err.response.data === "string" ? err.response.data : "Bir hata oluştu.");
            } else {
                setError("Sunucuya ulaşılamadı.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div style={{ marginBottom: "20px" }}>
                    <RiLockPasswordLine size={50} color="white" style={{ opacity: 0.8 }} />
                </div>
                <h1 className="login-title" style={{ fontSize: "28px", marginBottom: "10px" }}>Şifreni mi Unuttun?</h1>

                <p style={{ fontSize: "14px", marginBottom: "30px", opacity: 0.8, lineHeight: "1.5" }}>
                    Aşağıdaki kutucuğa girdiğin eposta adresine sıfırlama linki gönderilir
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="input-wrapper">
                        <MdEmail className="input-icon" />
                        <input
                            type="email"
                            className="modern-input"
                            placeholder="E-posta"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Bağlantı Gönder"}
                    </button>
                </form>

               
                {message && (
                    <div style={{
                        marginTop: "20px",
                        padding: "15px",
                        background: "rgba(40, 167, 69, 0.2)",
                        border: "1px solid rgba(40, 167, 69, 0.4)",
                        borderRadius: "10px",
                        color: "#155724",  
                        fontSize: "14px",
                        fontWeight: "bold"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                            <span>✅</span>
                            <span>{message}</span>
                        </div>
                        <br />
                        <small style={{ opacity: 0.9, color: "#155724" }}>Lütfen e-posta kutunuzu kontrol edin.</small>
                    </div>
                )}

                {error && <div className="error-msg">⚠️ {error}</div>}

                <div className="link-text" style={{ marginTop: "30px" }}>
                    <Link to="/login">← Giriş Sayfasına Dön</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;