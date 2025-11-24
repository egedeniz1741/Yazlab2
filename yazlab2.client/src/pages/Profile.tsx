import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import FeedCard from "../components/FeedCard";
import type { FeedItem } from "../types";
import "./Profile.css";

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
    const [user, setUser] = useState<UserProfile | null>(null);
    const [movies, setMovies] = useState<LibraryItem[]>([]);
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [customLists, setCustomLists] = useState<CustomList[]>([]);
    const [activities, setActivities] = useState<FeedItem[]>([]);

    const [activeTab, setActiveTab] = useState("activities");
    const [loading, setLoading] = useState(true);

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

            const [movieRes, bookRes, listRes, activityRes] = await Promise.all([
                api.get(`/api/library/user-movies/${targetUser}`),
                api.get(`/api/library/user-books/${targetUser}`),
                userRes.data.isMe
                    ? api.get("/api/customlist/my-lists")
                    : api.get(`/api/customlist/user-lists/${targetUserId}`),
                api.get(`/api/social/user-feed/${targetUser}`)
            ]);

            setMovies(movieRes.data);
            setBooks(bookRes.data);
            setCustomLists(listRes.data);
            setActivities(activityRes.data);

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

    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (!user) return <div className="not-found">Kullanıcı bulunamadı.</div>;

    return (
        <div className="profile-container">
            <button onClick={() => navigate("/")} className="back-button">
                <span>←</span> Ana Sayfa
            </button>

            {/* PROFİL KARTI */}
            <div className="profile-card">
                <img
                    src={user.avatarUrl || "https://via.placeholder.com/150"}
                    alt={user.username}
                    className="avatar"
                />
                <div className="profile-info">
                    <div className="profile-header">
                        <h1 className="username">@{user.username}</h1>

                        {user.isMe ? (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={isEditing ? "cancel-edit-btn" : "edit-btn"}
                            >
                                {isEditing ? "İptal" : "Profili Düzenle"}
                            </button>
                        ) : (
                            <button
                                onClick={handleFollowToggle}
                                className={user.isFollowing ? "unfollow-btn" : "follow-btn"}
                            >
                                {user.isFollowing ? "Takipten Çık" : "Takip Et"}
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="edit-form">
                            <textarea
                                value={editBio}
                                onChange={e => setEditBio(e.target.value)}
                                rows={3}
                                className="edit-textarea"
                                placeholder="Biyografinizi yazın..."
                            />
                            <input
                                type="file"
                                onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                                className="file-input"
                            />
                            <button onClick={handleUpdateProfile} className="save-btn">
                                ✓ Kaydet
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="bio">{user.bio || "Henüz bir biyografi eklenmemiş."}</p>
                            <div className="stats">
                                <span><strong>{user.followersCount}</strong> Takipçi</span>
                                <span><strong>{user.followingCount}</strong> Takip</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* SEKMELER */}
            <div className="tabs">
                <button onClick={() => setActiveTab("activities")} className={activeTab === "activities" ? "tab active" : "tab"}>
                    ⚡ Son Aktiviteler
                </button>
                <button onClick={() => setActiveTab("movies")} className={activeTab === "movies" ? "tab active" : "tab"}>
                    🎬 Filmler
                </button>
                <button onClick={() => setActiveTab("books")} className={activeTab === "books" ? "tab active" : "tab"}>
                    📚 Kitaplar
                </button>
                <button onClick={() => setActiveTab("lists")} className={activeTab === "lists" ? "tab active" : "tab"}>
                    📂 Listeler
                </button>
            </div>

            <div className="content">
                {/* 1. AKTİVİTELER */}
                {activeTab === "activities" && (
                    <div>
                        {activities.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">⚡</div>
                                <p>Henüz bir aktivite yok.</p>
                            </div>
                        ) : (
                            activities.map((item, index) => (
                                <FeedCard key={`act-${index}`} item={item} />
                            ))
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

                {/* 4. LİSTELER */}
                {activeTab === "lists" && (
                    <div>
                        {user.isMe && (
                            <button onClick={handleCreateList} className="create-list-btn">
                                + Yeni Liste Oluştur
                            </button>
                        )}

                        <div className="lists-grid">
                            {customLists.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">📂</div>
                                    <p>Henüz liste oluşturulmamış.</p>
                                </div>
                            )}

                            {customLists.map(list => (
                                <div
                                    key={list.id}
                                    onClick={() => navigate(`/list/${list.id}`)}
                                    className="list-card"
                                >
                                    <div className="list-thumbnails">
                                        {list.thumbnails.length > 0 ? (
                                            list.thumbnails.map((url, i) => (
                                                <img key={i} src={url} className="thumb" alt="" />
                                            ))
                                        ) : (
                                            <div className="empty-thumb">Boş Liste</div>
                                        )}
                                    </div>

                                    <div className="list-info">
                                        <h4>{list.name}</h4>
                                        <p>{list.itemCount} içerik</p>
                                    </div>

                                    {user.isMe && (
                                        <button
                                            onClick={(e) => handleDeleteList(list.id, e)}
                                            className="delete-list-btn"
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
        </div>
    );
}

const Section = ({ title, items, type, navigate }: any) => (
    <div className="section">
        <h3 className="section-title">{title} <span>({items.length})</span></h3>

        {items.length === 0 ? (
            <p className="section-empty">Bu liste boş.</p>
        ) : (
            <div className="section-grid">
                {items.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(type === "movie" ? `/movie/${item.tmdbId}` : `/book/${item.googleId}`)}
                        className="item-card"
                    >
                        <img
                            src={type === "movie" ? item.posterUrl : item.coverUrl}
                            alt={item.title}
                            className="item-img"
                        />
                        <p className="item-title">{item.title}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default Profile;
