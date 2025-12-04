import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css"; 


import { FaLock, FaUser } from "react-icons/fa";
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
            
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await api.post("/api/auth/login", {
                email,
                password
            });

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
                <p className="brand-text">MyFilm&BookArchive</p>

                <form onSubmit={handleLogin}>

                   
                    <div className="input-wrapper">
                        <MdEmail className="input-icon" />
                        <input
                            type="email"
                            className="modern-input"
                            placeholder="E-posta veya Kullanıcı Adı"
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
                            placeholder="Parola"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                  
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Oturum Aç"}
                    </button>
                </form>

               
                {error && <div className="error-msg">⚠️ {error}</div>}

                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontSize: "13px" }}>
                    <div className="link-text" style={{ marginTop: 0 }}>
                        <Link to="/forgot-password" style={{ color: "#aaa" }}>Şifremi unuttum</Link>
                    </div>
                </div>

                <div className="link-text" style={{ marginTop: "30px" }}>
                    Bu platformda yeni misiniz? <Link to="/register">Şimdi kaydolun.</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;