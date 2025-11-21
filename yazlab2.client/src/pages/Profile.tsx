import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import FeedCard from "../components/FeedCard"; // EKLENDİ: Kart bileşeni
import type { FeedItem } from "../types";     // EKLENDİ: Tip tanımı

// --- TİP TANIMLARI ---
interface UserProfile {
    id: number;
    username: string;
    bio: string;
    avatarUrl: string;
    isMe: boolean;
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
}

interface LibraryItem {
    id: number;
    tmdbId?: string;
    googleId?: string;
    title: string;
    posterUrl?: string;
    coverUrl?: string;
    status: string;
}

interface CustomList {
    id: number;
    name: string;
    itemCount: number;
    thumbnails: string[];
}

function Profile() {
    // State'ler
    const [user, setUser] = useState<UserProfile | null>(null);
    const [movies, setMovies] = useState<LibraryItem[]>([]);
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [customLists, setCustomLists] = useState<CustomList[]>([]);
    const [activities, setActivities] = useState<FeedItem[]>([]); // YENİ: Aktiviteler

    const [activeTab, setActiveTab] = useState("activities"); // Varsayılan sekme "activities" olsun
    const [loading, setLoading] = useState(true);

    // Düzenleme Modu
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const navigate = useNavigate();
    const { username } = useParams();

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const endpoint = username ? `/api/user/profile/${username}` : "/api/user/profile";
            const userRes = await api.get(endpoint);
            setUser(userRes.data);
            setEditBio(userRes.data.bio || "");

            const targetUser = userRes.data.username;
            const targetUserId = userRes.data.id;

            // Tüm verileri paralel çekelim (Aktiviteler dahil)
            const [movieRes, bookRes, listRes, activityRes] = await Promise.all([
                api.get(`/api/library/user-movies/${targetUser}`),
                api.get(`/api/library/user-books/${targetUser}`),
                userRes.data.isMe
                    ? api.get("/api/customlist/my-lists")
                    : api.get(`/api/customlist/user-lists/${targetUserId}`),
                api.get(`/api/social/user-feed/${targetUser}`) // YENİ: Aktivite çekme
            ]);

            setMovies(movieRes.data);
            setBooks(bookRes.data);
            setCustomLists(listRes.data);
            setActivities(activityRes.data); // State'e kaydet

        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                await api.post("/api/user/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
            }
            await api.put("/api/user/update", { bio: editBio, avatarUrl: null });
            alert("Profil güncellendi!");
            setIsEditing(false);
            loadProfile();
        } catch (error) {
            alert("Hata oluştu.");
        }
    };

    const handleFollowToggle = async () => {
        if (!user) return;
        try {
            if (user.isFollowing) {
                await api.delete(`/api/social/unfollow/${user.id}`);
            } else {
                await api.post(`/api/social/follow/${user.id}`);
            }
            setUser(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
        } catch (error) {
            alert("İşlem başarısız.");
        }
    };

    const handleCreateList = async () => {
        const name = prompt("Liste adı giriniz:");
        if (!name) return;
        try {
            await api.post("/api/customlist/create", { name });
            alert("Liste oluşturuldu!");
            loadProfile();
        } catch (error) { alert("Hata oluştu."); }
    };

    const handleDeleteList = async (id: number, e: any) => {
        e.stopPropagation();
        if (!confirm("Listeyi silmek istiyor musunuz?")) return;
        try {
            await api.delete(`/api/customlist/${id}`);
            loadProfile();
        } catch (error) { alert("Silinemedi."); }
    };

    const watchedMovies = movies.filter(m => m.status === "Watched");
    const planMovies = movies.filter(m => m.status === "PlanToWatch");
    const readBooks = books.filter(b => b.status === "Read");
    const planBooks = books.filter(b => b.status === "PlanToRead");

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Yükleniyor...</div>;
    if (!user) return <div style={{ textAlign: "center", marginTop: "50px" }}>Kullanıcı bulunamadı.</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            <button onClick={() => navigate("/")} style={{ marginBottom: "20px", cursor: "pointer" }}>← Ana Sayfa</button>

            {/* PROFİL KARTI */}
            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", padding: "30px", backgroundColor: "#f8f9fa", borderRadius: "15px", marginBottom: "30px" }}>
                <img src={user.avatarUrl || "https://via.placeholder.com/150"} alt={user.username} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h1 style={{ margin: "0 0 10px 0" }}>@{user.username}</h1>

                        {user.isMe ? (
                            <button onClick={() => setIsEditing(!isEditing)} style={{ padding: "8px 15px", backgroundColor: isEditing ? "#dc3545" : "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                {isEditing ? "İptal" : "Profili Düzenle"}
                            </button>
                        ) : (
                            <button onClick={handleFollowToggle} style={{ padding: "8px 20px", backgroundColor: user.isFollowing ? "#dc3545" : "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                                {user.isFollowing ? "Takipten Çık" : "Takip Et"}
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} style={{ padding: "10px", width: "100%" }} />
                            <input type="file" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                            <button onClick={handleUpdateProfile} style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Kaydet</button>
                        </div>
                    ) : (
                        <>
                            <p>{user.bio || "Biyografi yok."}</p>
                            <div style={{ display: "flex", gap: "20px", marginTop: "15px", fontWeight: "bold" }}>
                                <span>{user.followersCount} Takipçi</span><span>{user.followingCount} Takip</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* SEKMELER */}
            <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                {/* YENİ: Son Aktiviteler Sekmesi */}
                <button onClick={() => setActiveTab("activities")} style={tabStyle(activeTab === "activities")}>⚡ Son Aktiviteler</button>

                <button onClick={() => setActiveTab("movies")} style={tabStyle(activeTab === "movies")}>🎬 Filmler</button>
                <button onClick={() => setActiveTab("books")} style={tabStyle(activeTab === "books")}>📚 Kitaplar</button>
                <button onClick={() => setActiveTab("lists")} style={tabStyle(activeTab === "lists")}>📂 Listeler</button>
            </div>

            {/* İÇERİK */}

            {/* 1. SON AKTİVİTELER SEKMESİ (YENİ) */}
            {activeTab === "activities" && (
                <div>
                    {activities.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#999", fontStyle: "italic", marginTop: "30px" }}>Henüz bir aktivite yok.</p>
                    ) : (
                        <div>
                            {activities.map((item, index) => (
                                // Mevcut FeedCard bileşenini kullanıyoruz
                                <FeedCard key={`act-${index}`} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 2. FİLMLER */}
            {activeTab === "movies" && (
                <div>
                    <Section title="✅ İzledikleri" items={watchedMovies} type="movie" navigate={navigate} />
                    <Section title="📅 İzleyecekleri" items={planMovies} type="movie" navigate={navigate} />
                </div>
            )}

            {/* 3. KİTAPLAR */}
            {activeTab === "books" && (
                <div>
                    <Section title="✅ Okudukları" items={readBooks} type="book" navigate={navigate} />
                    <Section title="📖 Okuyacakları" items={planBooks} type="book" navigate={navigate} />
                </div>
            )}

            {/* 4. ÖZEL LİSTELER */}
            {activeTab === "lists" && (
                <div>
                    {user.isMe && (
                        <button onClick={handleCreateList} style={{ marginBottom: "20px", padding: "10px 20px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>+ Yeni Liste Oluştur</button>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                        {customLists.length === 0 && <p style={{ color: "#999" }}>Henüz liste oluşturulmamış.</p>}

                        {customLists.map(list => (
                            <div
                                key={list.id}
                                onClick={() => navigate(`/list/${list.id}`)}
                                style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", position: "relative", cursor: "pointer", transition: "transform 0.2s" }}
                            >
                                <div style={{ height: "150px", backgroundColor: "#eee", display: "flex", flexWrap: "wrap" }}>
                                    {list.thumbnails.length > 0 ? (
                                        list.thumbnails.map((url, i) => <img key={i} src={url} style={{ width: "33%", height: "100%", objectFit: "cover" }} />)
                                    ) : (
                                        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Boş</div>
                                    )}
                                </div>
                                <div style={{ padding: "10px" }}>
                                    <h4 style={{ margin: 0 }}>{list.name}</h4>
                                    <p style={{ fontSize: "12px", color: "#666" }}>{list.itemCount} içerik</p>
                                </div>

                                {user.isMe && (
                                    <button
                                        onClick={(e) => handleDeleteList(list.id, e)}
                                        style={{ position: "absolute", top: "5px", right: "5px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "25px", height: "25px", cursor: "pointer" }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const Section = ({ title, items, type, navigate }: any) => (
    <div style={{ marginBottom: "40px" }}>
        <h3>{title} ({items.length})</h3>
        {items.length === 0 ? <p style={{ color: "#999", fontStyle: "italic" }}>Bu liste boş.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
                {items.map((item: any) => (
                    <div key={item.id} onClick={() => navigate(type === "movie" ? `/movie/${item.tmdbId}` : `/book/${item.googleId}`)} style={{ cursor: "pointer" }}>
                        <img src={type === "movie" ? item.posterUrl : item.coverUrl} alt={item.title} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                        <p style={{ fontSize: "13px", margin: "5px 0 0 0", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const tabStyle = (isActive: boolean) => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: isActive ? "3px solid #007bff" : "3px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    color: isActive ? "#007bff" : "#555"
});

export default Profile;