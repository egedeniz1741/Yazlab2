import { useState } from "react";
import api from "../api"; 
import { useNavigate } from "react-router-dom";

interface UserResult {
    id: number;
    username: string;
    avatarUrl: string;
    isFollowing: boolean;
}

function Social() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e: any) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/api/social/search?query=${query}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Arama hatası:", error);
            alert("Kullanıcı aranırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (user: UserResult) => {
        try {
            if (user.isFollowing) {
                // Takipten Çık
                await api.delete(`/api/social/unfollow/${user.id}`);
            } else {
                // Takip Et
                await api.post(`/api/social/follow/${user.id}`);
            }

            // Listeyi güncelle (Butonun durumunu değiştir)
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
            ));

        } catch (error) {
            console.error("Takip işlemi hatası:", error);
            alert("İşlem başarısız.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <button onClick={() => navigate("/")} style={{ marginBottom: "20px", cursor: "pointer" }}>← Ana Sayfaya Dön</button>

            <h1 style={{ textAlign: "center" }}>Arkadaş Bul</h1>

            {/* Arama Formu */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                <input
                    type="text"
                    placeholder="Kullanıcı adı ara..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Ara
                </button>
            </form>

            {loading && <div style={{ textAlign: "center" }}>Aranıyor...</div>}

            {/* Sonuç Listesi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {users.map((user) => (
                    <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #eee", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>

                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <img src={user.avatarUrl} alt={user.username} style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
                            <span style={{ fontWeight: "bold", fontSize: "18px" }}>{user.username}</span>
                        </div>

                        <button
                            onClick={() => handleFollowToggle(user)}
                            style={{
                                padding: "8px 15px",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                                color: "white",
                                backgroundColor: user.isFollowing ? "#dc3545" : "#28a745" // Kırmızı (Çık) veya Yeşil (Et)
                            }}
                        >
                            {user.isFollowing ? "Takipten Çık" : "Takip Et"}
                        </button>

                    </div>
                ))}

                {!loading && users.length === 0 && query !== "" && (
                    <p style={{ textAlign: "center", color: "#999" }}>Kullanıcı bulunamadı.</p>
                )}
            </div>
        </div>
    );
}

export default Social;