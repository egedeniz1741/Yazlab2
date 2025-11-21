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

    // Düzenleme State'leri
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

    // Yorum Ekle
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

    // --- SİLME FONKSİYONU (YENİ) ---
    const handleDelete = async (id: number) => {
        // Kullanıcıya onay soralım
        if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

        try {
            await api.delete(`/api/review/${id}`);
            alert("Yorum silindi.");
            fetchReviews(); // Listeyi yenile
        } catch (error) {
            alert("Silme işlemi başarısız.");
        }
    };

    // Düzenlemeyi Başlat
    const startEdit = (review: Review) => {
        setEditingId(review.id);
        setEditText(review.content);
    };

    // Düzenlemeyi Kaydet
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
        <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
            <h3>💬 Yorumlar ({reviews.length})</h3>

            {/* Yorum Yapma Formu */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Düşüncelerini yaz..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <button onClick={handleSubmit} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Gönder
                </button>
            </div>

            {loading ? <p>Yükleniyor...</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {reviews.length === 0 && <p style={{ color: "#999" }}>Henüz yorum yapılmamış.</p>}

                    {reviews.map((r) => (
                        <div key={r.id} style={{ backgroundColor: "white", padding: "15px", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                {/* Sol: Avatar ve İsim */}
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img src={r.userAvatar || "https://via.placeholder.com/40"} alt={r.username} style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                                    <span style={{ fontWeight: "bold" }}>{r.username}</span>
                                    <span style={{ fontSize: "12px", color: "#999" }}>{r.date}</span>
                                </div>

                                {/* Sağ: Butonlar (Sadece benim yorumumsa) */}
                                {r.isMyReview && !editingId && (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {/* YEŞİL KALEM (Edit) */}
                                        <button
                                            onClick={() => startEdit(r)}
                                            title="Düzenle"
                                            style={{ backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", padding: "5px 10px", cursor: "pointer", fontSize: "14px" }}
                                        >
                                            ✏️
                                        </button>

                                        {/* KIRMIZI ÇÖP KUTUSU (Delete) - YENİ */}
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            title="Sil"
                                            style={{ backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", padding: "5px 10px", cursor: "pointer", fontSize: "14px" }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* İçerik veya Edit Modu */}
                            {editingId === r.id ? (
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #007bff" }}
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(r.id)} style={{ backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", padding: "5px 15px", cursor: "pointer" }}>Kaydet</button>
                                    <button onClick={() => setEditingId(null)} style={{ backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", padding: "5px 15px", cursor: "pointer" }}>İptal</button>
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: "#333", lineHeight: "1.5" }}>{r.content}</p>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewSection;