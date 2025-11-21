import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FeedItem } from "../types";
import api from "../api";

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Az önce";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " dk önce";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " saat önce";
    return Math.floor(hours / 24) + " gün önce";
};

interface Comment {
    id: number;
    user: string;
    userAvatar: string;
    content: string;
    date: string;
}

interface Props {
    item: FeedItem;
}

function FeedCard({ item }: Props) {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(item.isLiked);
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [isExpanded, setIsExpanded] = useState(false); // Yorumu genişletme state'i

    // Aktivite Yorumları (Kartın altına yapılanlar)
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const loadComments = async () => {
        if (showComments) { setShowComments(false); return; }
        setLoadingComments(true);
        setShowComments(true);
        try {
            const params = new URLSearchParams();
            params.append("targetUser", item.user);
            if (item.type === "Movie") params.append("tmdbId", item.contentId.toString());
            else params.append("googleId", item.contentId.toString());
            const res = await api.get(`/api/social/comments?${params.toString()}`);
            setComments(res.data);
        } catch (error) { console.error("Yorumlar yüklenemedi"); } finally { setLoadingComments(false); }
    };

    const sendComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await api.post("/api/social/comment", {
                targetUsername: item.user,
                tmdbId: item.type === "Movie" ? item.contentId : null,
                googleId: item.type === "Book" ? item.contentId : null,
                content: commentText
            });
            setComments([...comments, { id: res.data.id, user: res.data.user, userAvatar: "https://via.placeholder.com/30", content: commentText, date: "Az önce" }]);
            setCommentText("");
        } catch (error) { alert("Yorum gönderilemedi."); }
    };

    const handleLike = async (e: any) => {
        e.stopPropagation();
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        try {
            await api.post("/api/interaction/toggle-like", {
                tmdbId: item.type === "Movie" ? item.contentId : null,
                googleId: item.type === "Book" ? item.contentId : null
            });
        } catch { setLiked(!newLikedState); setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1); }
    };

    const goToProfile = (e: any) => { e.stopPropagation(); navigate(`/profile/${item.user}`); };
    const goToDetail = () => { if (item.type === "Movie") navigate(`/movie/${item.contentId}`); else navigate(`/book/${item.contentId}`); };

    // Yorum Metni İşleme
    const reviewText = item.reviewText || "";
    const isLongText = reviewText.length > 150;
    const displayedText = isExpanded ? reviewText : reviewText.substring(0, 150) + (isLongText ? "..." : "");

    return (
        <div style={{ border: "1px solid #e1e8ed", borderRadius: "12px", marginBottom: "20px", backgroundColor: "white", maxWidth: "500px", margin: "20px auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "12px 15px", borderBottom: "1px solid #f0f2f5" }}>
                <img src={item.userAvatar || "https://via.placeholder.com/50"} alt={item.user} style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", cursor: "pointer" }} onClick={goToProfile} />
                <div>
                    <p style={{ margin: 0, fontSize: "15px" }}>
                        <span onClick={goToProfile} style={{ fontWeight: "bold", cursor: "pointer" }}>{item.user}</span>
                        <span style={{ color: "#65676b", marginLeft: "5px" }}>{item.action}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#65676b" }}>{timeAgo(item.date)}</p>
                </div>
            </div>

            {/* Body */}
            <div onClick={goToDetail} style={{ padding: "15px", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "15px" }}>
                    <img src={item.image} alt={item.title} style={{ width: "80px", borderRadius: "6px", objectFit: "cover" }} />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{item.title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ backgroundColor: item.type === "Movie" ? "#e3f2fd" : "#fce4ec", color: item.type === "Movie" ? "#1565c0" : "#880e4f", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}>
                                {item.type === "Movie" ? "🎬 FİLM" : "📚 KİTAP"}
                            </span>
                            {item.rating && <span style={{ fontSize: "13px", color: "#f57c00", fontWeight: "bold" }}>★ {item.rating}/10</span>}
                        </div>
                    </div>
                </div>

                {/* --- YORUM ALINTISI (REVIEW TEXT) --- */}
                {item.reviewText && (
                    <div style={{ marginTop: "15px", backgroundColor: "#f7f9fa", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#333", lineHeight: "1.5", fontStyle: "italic" }}>
                        " {displayedText} "

                        {/* Devamını Oku Linki */}
                        {isLongText && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation(); // Karta tıklayıp sayfaya gitmesin
                                    setIsExpanded(!isExpanded);
                                }}
                                style={{ color: "#007bff", cursor: "pointer", marginLeft: "5px", fontWeight: "bold", fontSize: "12px" }}
                            >
                                {isExpanded ? "Daha az göster" : "daha fazlasını oku"}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: "8px 15px", borderTop: "1px solid #f0f2f5", borderBottom: showComments ? "1px solid #f0f2f5" : "none", display: "flex", justifyContent: "space-around" }}>
                <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? "#e91e63" : "#65676b", fontWeight: liked ? "bold" : "normal" }}>
                    {liked ? "❤️ Beğendin" : "🤍 Beğen"} ({likeCount})
                </button>
                <button onClick={(e) => { e.stopPropagation(); loadComments(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#65676b" }}>
                    💬 Yorum Yap
                </button>
            </div>

            {/* --- AKTİVİTE YORUMLARI --- */}
            {showComments && (
                <div style={{ padding: "10px 15px", backgroundColor: "#f9f9f9", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div style={{ marginBottom: "10px", maxHeight: "200px", overflowY: "auto" }}>
                        {loadingComments && <p style={{ fontSize: "12px", color: "#999" }}>Yükleniyor...</p>}
                        {comments.map(c => (
                            <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "bold", fontSize: "13px" }}>{c.user}:</span>
                                <span style={{ fontSize: "13px" }}>{c.content}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" placeholder="Yorum yaz..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "1px solid #ccc", fontSize: "13px" }} />
                        <button onClick={sendComment} style={{ backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "20px", padding: "0 15px", cursor: "pointer", fontSize: "12px" }}>Gönder</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedCard;