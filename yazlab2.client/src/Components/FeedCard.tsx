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

interface Comment { id: number; user: string; userAvatar: string; content: string; date: string; }
interface Props { item: FeedItem; }

function FeedCard({ item }: Props) {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(item.isLiked);
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const loadComments = async () => {
        if (showComments) { setShowComments(false); return; }
        setLoadingComments(true); setShowComments(true);
        try {
            const params = new URLSearchParams();
            params.append("targetUser", item.user);
            if (item.type === "Movie") params.append("tmdbId", item.contentId.toString());
            else params.append("googleId", item.contentId.toString());
            const res = await api.get(`/api/social/comments?${params.toString()}`);
            setComments(res.data);
        } catch (error) { console.error("Yorum hatası"); } finally { setLoadingComments(false); }
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
        } catch (error) { alert("Gönderilemedi."); }
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

    const reviewText = item.reviewText || "";
    const isLongText = reviewText.length > 150;
    const displayedText = isExpanded ? reviewText : reviewText.substring(0, 150) + (isLongText ? "..." : "");

    return (
        <div style={{ border: "1px solid #3f3f46", borderRadius: "12px", marginBottom: "20px", backgroundColor: "#27272a", maxWidth: "500px", margin: "20px auto", color: "#e4e4e7" }}>

           
            <div style={{ display: "flex", alignItems: "center", padding: "12px 15px", borderBottom: "1px solid #3f3f46" }}>
                <img src={item.userAvatar || "https://via.placeholder.com/50"} alt={item.user} style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", objectFit: "cover", cursor: "pointer" }} onClick={goToProfile} />
                <div>
                    <p style={{ margin: 0, fontSize: "15px" }}>
                        <span onClick={goToProfile} style={{ fontWeight: "bold", cursor: "pointer", color: "#e4e4e7" }}>{item.user}</span>
                        <span style={{ color: "#a1a1aa", marginLeft: "5px" }}>{item.action}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#71717a" }}>{timeAgo(item.date)}</p>
                </div>
            </div>

            
            <div onClick={goToDetail} style={{ padding: "15px", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "15px" }}>
                    <img src={item.image} alt={item.title} style={{ width: "80px", borderRadius: "6px", objectFit: "cover" }} />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                        <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#e4e4e7" }}>{item.title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ backgroundColor: item.type === "Movie" ? "rgba(59, 130, 246, 0.2)" : "rgba(236, 72, 153, 0.2)", color: item.type === "Movie" ? "#60a5fa" : "#f472b6", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}>
                                {item.type === "Movie" ? "🎬 FİLM" : "📚 KİTAP"}
                            </span>
                            {item.rating && <span style={{ fontSize: "13px", color: "#fbbf24", fontWeight: "bold" }}>★ {item.rating}/10</span>}
                        </div>
                    </div>
                </div>

                {item.reviewText && (
                    <div style={{ marginTop: "15px", backgroundColor: "#18181b", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#d4d4d8", lineHeight: "1.5", fontStyle: "italic", border: "1px solid #3f3f46" }}>
                        " {displayedText} "
                        {isLongText && <span onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ color: "#60a5fa", cursor: "pointer", marginLeft: "5px", fontWeight: "bold", fontSize: "12px" }}>{isExpanded ? "Daha az" : "devamı"}</span>}
                    </div>
                )}
            </div>

         
            <div style={{ padding: "8px 15px", borderTop: "1px solid #3f3f46", borderBottom: showComments ? "1px solid #3f3f46" : "none", display: "flex", justifyContent: "space-around" }}>
                <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? "#ef4444" : "#a1a1aa", fontWeight: liked ? "bold" : "normal" }}>
                    {liked ? "❤️ Beğendin" : "🤍 Beğen"} ({likeCount})
                </button>
                <button onClick={(e) => { e.stopPropagation(); loadComments(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa" }}>💬 Yorum Yap</button>
            </div>

            
            {showComments && (
                <div style={{ padding: "15px", backgroundColor: "#18181b", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div style={{ marginBottom: "10px", maxHeight: "200px", overflowY: "auto" }}>
                        {loadingComments && <p style={{ fontSize: "12px", color: "#71717a" }}>Yükleniyor...</p>}
                        {comments.map(c => (
                            <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#e4e4e7" }}>{c.user}:</span>
                                <span style={{ fontSize: "13px", color: "#d4d4d8" }}>{c.content}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" placeholder="Yorum yaz..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white", fontSize: "13px" }} />
                        <button onClick={sendComment} style={{ backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "20px", padding: "0 15px", cursor: "pointer", fontSize: "12px" }}>Gönder</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedCard;