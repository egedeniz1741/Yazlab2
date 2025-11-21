import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Geri dönmek için

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");     // Baþarýlý mesajý için
    const [error, setError] = useState("");         // Hata mesajý için
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            // Backend'e isteði at
            const response = await axios.post("/api/auth/forgot-password", { email });
            
            // Baþarýlýysa mesajý göster
            setMessage(response.data); // "Þifre sýfýrlama linki..."
            
        } catch (err: any) {
            // Backend'den gelen hatayý yakala (BadRequest)
            if (err.response && err.response.data) {
                // Backend düz yazý gönderdiði için direkt data'yý alýyoruz
                setError(typeof err.response.data === "string" ? err.response.data : "Bir hata oluþtu.");
            } else {
                setError("Sunucuya ulaþýlamadý.");
            }
        }
    };

    return (
        <div style={{ padding: "50px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Þifremi Unuttum</h2>
            <p style={{color: "#666", fontSize: "14px"}}>Sistemde kayýtlý e-posta adresinizi giriniz.</p>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                <input 
                    type="email" 
                    placeholder="E-posta adresiniz" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={{ padding: "12px", borderRadius: "5px", border: "1px solid #ccc" }} 
                />
                
                <button 
                    type="submit" 
                    style={{ padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                    Sýfýrlama Linki Gönder
                </button>
            </form>

            {/* Mesaj Alanlarý */}
            {message && (
                <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px" }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "5px" }}>
                    {error}
                </div>
            )}

            <button 
                onClick={() => navigate("/login")}
                style={{ marginTop: "20px", background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline" }}
            >
                Giriþ Sayfasýna Dön
            </button>
        </div>
    );
}

export default ForgotPassword;