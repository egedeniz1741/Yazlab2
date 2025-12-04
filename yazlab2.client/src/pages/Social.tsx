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

    const handleFollowToggle = async (user: UserResult, e: any) => {
        e.stopPropagation(); 
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

 
    const goToProfile = (username: string) => {
        navigate(`/profile/${username}`);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", color: "#e4e4e7" }}>
            <button onClick={() => navigate("/")} style={{ marginBottom: "20px", cursor: "pointer", background: "none", border: "none", color: "#3b82f6" }}>← Ana Sayfaya Dön</button>

            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Arkadaş Bul</h1>

            <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                <input
                    type="text"
                    placeholder="Kullanıcı adı ara..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white" }}
                />
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                    Ara
                </button>
            </form>

            {loading && <div style={{ textAlign: "center", color: "#a1a1aa" }}>Yükleniyor...</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {users.map((user) => (
                    <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #3f3f46", borderRadius: "12px", backgroundColor: "#27272a", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>

                       
                        <div
                            onClick={() => goToProfile(user.username)}
                            style={{ display: "flex", alignItems: "center", gap: "15px", cursor: "pointer" }}
                        >
                            <img src={user.avatarUrl || "https://via.placeholder.com/150"} alt={user.username} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid #3f3f46" }} />
                            <span style={{ fontWeight: "bold", fontSize: "18px", color: "#e4e4e7" }}>{user.username}</span>
                        </div>

                        <button
                            onClick={(e) => handleFollowToggle(user, e)}
                            style={{
                                padding: "8px 20px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                color: "white",
                                fontWeight: "bold",
                                backgroundColor: user.isFollowing ? "#ef4444" : "#22c55e"
                            }}
                        >
                            {user.isFollowing ? "Takipten Çık" : "Takip Et"}
                        </button>

                    </div>
                ))}

                {!loading && users.length === 0 && (
                    <p style={{ textAlign: "center", color: "#a1a1aa" }}>
                        {query ? "Kullanıcı bulunamadı." : "Henüz kimse yok."}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Social;