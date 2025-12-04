import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";


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
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let interval: any = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev: number) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendCode = async () => {
        if (!email) { alert("Lütfen e-posta girin."); return; }

        setIsSendingCode(true);
        try {
            await api.post("/api/auth/send-verification-code", { email });
            alert("Kod gönderildi! E-postanızı kontrol edin.");
            setIsCodeSent(true);
            setTimer(60);
        } catch (err: any) {
            alert(err.response?.data || "Kod gönderilemedi.");
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleRegister = async (e: any) => {
        e.preventDefault();
        if (password !== confirmPassword) { alert("Şifreler eşleşmiyor!"); return; }
        if (!isCodeSent) { alert("Lütfen önce kodu alıp doğrulayın."); return; }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            await api.post("/api/auth/register", {
                username,
                email,
                password,
                confirmPassword,
                verificationCode: code
            });
            alert("Kayıt Başarılı! Giriş yapabilirsiniz.");
            navigate("/login");
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
            <div className="login-card" style={{ width: "450px" }}>
                <h1 className="login-title">Kayıt Ol</h1>
                <p className="brand-text">MyFilm&BookArchive</p>

                <form onSubmit={handleRegister}>

                    <div className="input-wrapper">
                        <input type="text" className="modern-input" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <FaUser className="input-icon" />
                    </div>

                    <div className="form-row">
                        <div className="input-wrapper">
                            <input type="email" className="modern-input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <MdEmail className="input-icon" />
                        </div>

                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={timer > 0 || isSendingCode}
                            className="code-btn"
                        >
                            {isSendingCode ? <div className="spinner"></div> : (timer > 0 ? `${timer}s` : <RiSendPlaneFill size={18} />)}
                        </button>
                    </div>

                    {isCodeSent && (
                        <div className="input-wrapper" style={{ animation: "fadeIn 0.5s" }}>
                            <input
                                type="text"
                                className="modern-input"
                                placeholder="Gelen 5 Haneli Kod"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={5}
                                required
                                style={{ textAlign: "center", letterSpacing: "5px", borderColor: "#22c55e" }}
                            />
                            <FaKey className="input-icon" style={{ color: "#22c55e" }} />
                        </div>
                    )}

                    <div className="input-wrapper">
                        <input type="password" className="modern-input" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <FaLock className="input-icon" />
                    </div>

                    
                    <div className="input-wrapper">
                        <input
                            type="password"
                            className="modern-input"
                            placeholder="Şifre Tekrar"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required
                        />
                        <MdVerifiedUser className="input-icon" />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : "Aramıza Katıl"}
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