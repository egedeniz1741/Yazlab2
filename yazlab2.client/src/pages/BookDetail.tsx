import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import type { Book } from "../types";
import ReviewSection from "../components/ReviewSection";
import ListSelector from "../components/ListSelector";
import StarRating from "../components/StarRating";

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const bookRes = await api.get(`/api/books/${id}`);
                setBook(bookRes.data);
                const statusRes = await api.get(`/api/library/book-status/${bookRes.data.id}`);
                if (statusRes.data?.rating) setUserRating(statusRes.data.rating);
            } catch (error) { console.error("Hata", error); } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    const addToLibrary = async (status: string, ratingValue?: number) => {
        if (!book) return;
        try {
            await api.post("/api/library/add-book", { googleId: book.id, status, rating: ratingValue || userRating });
            if (!ratingValue) alert("Liste güncellendi!");
        } catch (error) { alert("Hata oluştu."); }
    };

    const handleRate = (rate: number) => { setUserRating(rate); addToLibrary("Read", rate); };

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "#a1a1aa" }}>Yükleniyor...</div>;
    if (!book) return <div style={{ textAlign: "center", marginTop: "50px", color: "#a1a1aa" }}>Kitap bulunamadı!</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", color: "#e4e4e7" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer", background: "none", border: "none", color: "#3b82f6" }}>← Geri Dön</button>

            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", backgroundColor: "#27272a", padding: "20px", borderRadius: "15px", border: "1px solid #3f3f46" }}>
                <div style={{ flexShrink: 0 }}>
                    <img src={book.coverUrl} alt={book.title} style={{ width: "250px", borderRadius: "5px", backgroundColor: "#eee" }} />
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: "0 0 10px 0" }}>{book.title}</h1>
                    <p style={{ fontSize: "18px", color: "#a1a1aa", fontStyle: "italic" }}>Yazar: {book.authors?.join(", ") || "Bilinmiyor"}</p>
                    <div style={{ margin: "20px 0", fontSize: "14px", color: "#d4d4d8" }}>
                        <span>📄 {book.pageCount} Sayfa</span><span style={{ marginLeft: "20px" }}>📅 {book.publishedDate}</span>
                    </div>

                    <div style={{ marginBottom: "20px" }}><StarRating rating={userRating} onRate={handleRate} /></div>

                    <h3 style={{ fontSize: "18px", borderBottom: "1px solid #3f3f46", paddingBottom: "5px" }}>Özet</h3>
                    <div style={{ lineHeight: "1.6", maxHeight: "300px", overflowY: "auto", paddingRight: "10px", color: "#d4d4d8" }} dangerouslySetInnerHTML={{ __html: book.description || "Açıklama bulunmuyor." }} />

                    <div style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button onClick={() => addToLibrary("Read")} style={btnStyle("#22c55e")}>✅ Okudum</button>
                        <button onClick={() => addToLibrary("PlanToRead")} style={btnStyle("#3b82f6")}>📖 Listeme Ekle</button>
                        <button onClick={() => setIsListModalOpen(true)} style={btnStyle("#a855f7")}>📂 Özel Listeye Ekle</button>
                    </div>
                </div>
            </div>

            <ReviewSection googleId={book.id} />
            <ListSelector isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} googleId={book.id} />
        </div>
    );
}

const btnStyle = (bgColor: string) => ({
    padding: "12px 24px", backgroundColor: bgColor, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold"
});

export default BookDetail;