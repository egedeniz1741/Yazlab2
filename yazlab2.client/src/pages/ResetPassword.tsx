import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(newPassword !== confirmNewPassword) { alert("Þifreler uyuþmuyor"); return; }

        try {
            await axios.post("/api/auth/reset-password", { 
                token, email, newPassword, confirmNewPassword 
            });
            alert("Þifre deðiþti! Giriþ yapýn.");
            navigate("/login");
        } catch (err) {
            alert("Hata: Link geçersiz olabilir.");
        }
    };

    if (!token || !email) return <div>Geçersiz Link</div>;

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Yeni Þifre Belirle</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <input type="password" placeholder="Yeni Þifre" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: "10px" }} />
                <input type="password" placeholder="Yeni Þifre Tekrar" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={{ padding: "10px" }} />
                <button type="submit" style={{ padding: "10px" }}>Deðiþtir</button>
            </form>
        </div>
    );
}
export default ResetPassword;