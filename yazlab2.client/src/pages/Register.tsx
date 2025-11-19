import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // TypeScript için 'e' değişkenine 'any' türünü verdik
    const handleRegister = async (e: any) => {
        e.preventDefault();
        try {
            await axios.post("/api/auth/register", {
                username,
                email,
                password
            });
            alert("Kayıt başarılı! Giriş yapabilirsin.");
            navigate("/login");
        } catch (err: any) {
            alert("Kayıt hatası: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Kayıt Ol</h2>
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ padding: "8px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: "8px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: "8px" }}
                    />
                </div>
                <button type="submit" style={{ padding: "10px 20px" }}>Kayıt Ol</button>
            </form>
            <p>Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
        </div>
    );
}

export default Register;