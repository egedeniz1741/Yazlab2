import { useEffect, useState } from "react";
import api from "../api";

interface Review {
    id: number;
    username: string;
    userAvatar: string;
    content: string;
    date: string;
    isMyReview: boolean;
}

interface Props {
    tmdbId?: number;
    googleId?: string;
}

function ReviewSection({ tmdbId, googleId }: Props) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState("");
    const [loading, setLoading] = useState(true);

    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const fetchReviews = async () => {
        try {
            let url = "";
            if (tmdbId) url = `/api/review/movie/${tmdbId}`;
            else if (googleId) url = `/api/review/book/${googleId}`;
            if (!url) return;

            const res = await api.get(url);
            setReviews(res.data);
        } catch (error) {
            console.error("Yorumlar çekilemedi", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [tmdbId, googleId]);

    const handleSubmit = async () => {
        if (!newReview.trim()) return;
        try {
            await api.post("/api/review/add", {
                tmdbId: tmdbId,
                googleBookId: googleId,
                content: newReview
            });
            setNewReview("");
            fetchReviews();
        } catch (error) {
            alert("Hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yorumu silmek istiyor musunuz?")) return;
        try {
            await api.delete(`/api/review/${id}`);
            fetchReviews();
        } catch (error) {
            alert("Silinemedi.");
        }
    };

    const startEdit = (review: Review) => {
        setEditingId(review.id);
        setEditText(review.content);
    };

    const saveEdit = async (id: number) => {
        if (!editText.trim()) return;
        try {
            await api.put(`/api/review/${id}`, { content: editText });
            alert("Yorum güncellendi!");
            setEditingId(null);
            fetchReviews();
        } catch (error) {
            alert("Güncelleme başarısız.");
        }
    };

    return (
        <div style={{ marginTop: "40px", padding: "25px", backgroundColor: "#27272a", borderRadius: "15px", border: "1px solid #3f3f46", color: "#e4e4e7" }}>
            <h3 style={{ borderBottom: "1px solid #3f3f46", paddingBottom: "15px", marginBottom: "20px" }}>
                💬 Yorumlar <span style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: "normal" }}>({reviews.length})</span>
            </h3>

           
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                <input
                    type="text"
                    placeholder="Düşüncelerini yaz..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3f3f46",
                        backgroundColor: "#18181b",
                        color: "white",
                        outline: "none"
                    }}
                />
                <button onClick={handleSubmit} style={{ padding: "10px 25px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                    Gönder
                </button>
            </div>

            {loading ? <p style={{ color: "#a1a1aa", textAlign: "center" }}>Yükleniyor...</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {reviews.length === 0 && <p style={{ color: "#a1a1aa", textAlign: "center", fontStyle: "italic" }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>}

                    {reviews.map((r) => (
                        <div key={r.id} style={{ backgroundColor: "#18181b", padding: "20px", borderRadius: "10px", border: "1px solid #3f3f46" }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                               
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <img src={r.userAvatar || "https://via.placeholder.com/40"} alt={r.username} style={{ width: "35px", height: "35px", borderRadius: "50%", border: "1px solid #3f3f46" }} />
                                    <div>
                                        <span style={{ fontWeight: "bold", display: "block", fontSize: "14px", color: "#e4e4e7" }}>{r.username}</span>
                                        <span style={{ fontSize: "11px", color: "#71717a" }}>{r.date}</span>
                                    </div>
                                </div>

                               
                                {r.isMyReview && !editingId && (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => startEdit(r)} title="Düzenle" style={{ backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>✏️</button>
                                        <button onClick={() => handleDelete(r.id)} title="Sil" style={{ backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>🗑️</button>
                                    </div>
                                )}
                            </div>

                           
                            {editingId === r.id ? (
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #3b82f6", backgroundColor: "#27272a", color: "white", outline: "none" }}
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(r.id)} style={{ backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "0 20px", cursor: "pointer", fontWeight: "bold" }}>Kaydet</button>
                                    <button onClick={() => setEditingId(null)} style={{ backgroundColor: "#52525b", color: "white", border: "none", borderRadius: "8px", padding: "0 20px", cursor: "pointer" }}>İptal</button>
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: "#d4d4d8", lineHeight: "1.6", fontSize: "14px" }}>{r.content}</p>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewSection;