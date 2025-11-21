import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Token yok, düz axios

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromUrl = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");

  const handleVerify = async (e: any) => {
    e.preventDefault();
    try {
        // verify-emailDto token ve email bekliyor
        await axios.post("/api/auth/verify-email", { token: code, email: email });
        alert("Doðrulama Baþarýlý! Giriþ yapabilirsin.");
        navigate("/login");
    } catch (error) {
        alert("Kod hatalý veya geçersiz.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Hesap Doðrulama</h2>
        <p>E-posta adresinize gelen 5 haneli kodu giriniz.</p>
        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta Adresi"
                required
                style={{ padding: "10px" }} 
            />
            <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="5 Haneli Kod"
                maxLength={5}
                required
                style={{ padding: "10px", fontSize: "20px", letterSpacing: "5px", width: "150px", textAlign: "center" }} 
            />
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>Doðrula</button>
        </form>
    </div>
  );
}
export default VerifyEmail;