import { useState, useEffect } from "react"; 
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
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();

   
    useEffect(() => {
        fetchUsers();
    }, []);

   
    const fetchUsers = async (searchQuery: string = "") => {
        setLoading(true);
        try {
            
            const url = searchQuery ? `/api/social/search?query=${searchQuery}` : "/api/social/search";
            const response = await api.get(url);
            setUsers(response.data);
        } catch (error) {
            console.error("Arama hatası:", error);
        } finally {
            setLoading(false);
        }
    };

   
    const handleSearch = (e: any) => {
        e.preventDefault();
        fetchUsers(query);
    };

    const handleFollowToggle = async (user: UserResult) => {
        try {
            if (user.isFollowing) {
                await api.delete(`/api/social/unfollow/${user.id}`);
            } else {
                await api.post(`/api/social/follow/${user.id}`);
            }
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
            ));
        } catch (error) {
            alert("İşlem başarısız.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <button onClick={() => navigate("/")} style={{ marginBottom: "20px", cursor: "pointer" }}>← Ana Sayfaya Dön</button>

            <h1 style={{ textAlign: "center" }}>Arkadaş Bul</h1>

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

            {loading && <div style={{ textAlign: "center" }}>Yükleniyor...</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {users.map((user) => (
                    <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #eee", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", backgroundColor: "white" }}>

                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <img src={user.avatarUrl || "https://via.placeholder.com/150"} alt={user.username} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
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
                                fontWeight: "bold",
                                backgroundColor: user.isFollowing ? "#dc3545" : "#28a745"
                            }}
                        >
                            {user.isFollowing ? "Takipten Çık" : "Takip Et"}
                        </button>

                    </div>
                ))}

                {!loading && users.length === 0 && (
                    <p style={{ textAlign: "center", color: "#999" }}>
                        {query ? "Kullanıcı bulunamadı." : "Henüz kimse yok."}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Social;