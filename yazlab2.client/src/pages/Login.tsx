import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // TypeScript için 'e' deðiþkenine 'any' türünü verdik
    const handleLogin = async (e: any) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            navigate("/");

        } catch (err) {
            setError("Giriþ baþarýsýz! E-posta veya þifre hatalý.");
        }
    };

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Giriþ Yap</h2>
            <form onSubmit={handleLogin}>
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
                        placeholder="Þifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: "8px" }}
                    />
                </div>
                <button type="submit" style={{ padding: "10px 20px" }}>Giriþ Yap</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>Hesabýn yok mu? <Link to="/register">Kayýt Ol</Link></p>
        </div>
    );
}

export default Login;