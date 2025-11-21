import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Yapay gecikme (Animasyonu görmek için, production'da kaldırabilirsin)
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await api.post("/api/auth/login", { email, password });
            localStorage.setItem("token", response.data.token);
            navigate("/");

        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(typeof err.response.data === "string" ? err.response.data : "Giriş başarısız.");
            } else {
                setError("Sunucuya bağlanılamadı.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Giriş Yap</h1>
               

                <form onSubmit={handleLogin}>

                    <div className="input-wrapper">
                        <MdEmail className="input-icon" />
                        <input
                            type="email"
                            className="modern-input"
                            placeholder="E-posta Adresi"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

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

                    <div style={{ textAlign: "right", marginBottom: "15px" }}>
                        <Link to="/forgot-password" style={{ color: "#666", fontSize: "12px", textDecoration: "none" }}>Şifremi Unuttum?</Link>
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Giriş Yap"}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                <div style={{ marginTop: "25px", fontSize: "14px", color: "#666" }}>
                    Hesabın yok mu? <Link to="/register" style={{ color: "#007bff", fontWeight: "bold", textDecoration: "none" }}>Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;