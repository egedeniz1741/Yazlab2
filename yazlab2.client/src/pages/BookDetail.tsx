import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import type { Book } from "../types";
import ReviewSection from "../components/ReviewSection";
import ListSelector from "../components/ListSelector";
import StarRating from "../components/StarRating";
import "./BookDetail.css";

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const bookRes = await api.get(`/api/books/${id}`);
                setBook(bookRes.data);

                const statusRes = await api.get(`/api/library/book-status/${bookRes.data.id}`);
                if (statusRes.data && statusRes.data.rating) {
                    setUserRating(statusRes.data.rating);
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const addToLibrary = async (status: string, ratingValue?: number) => {
        if (!book) return;
        try {
            await api.post("/api/library/add-book", {
                googleId: book.id,
                status: status,
                rating: ratingValue || userRating
            });
            if (ratingValue) console.log("Puanlandı.");
            else alert(status === "Read" ? "Kitap 'Okudum' listesine eklendi!" : "Kitap okuma listene eklendi!");
        } catch (error) {
            alert("Bir hata oluştu.");
        }
    };

    const handleRate = (rate: number) => {
        setUserRating(rate);
        addToLibrary("Read", rate);
    };

    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (!book) return <div className="not-found">Kitap bulunamadı!</div>;

    return (
        <div className="book-detail-container">
            <button onClick={() => navigate(-1)} className="back-button">
                <span className="back-arrow">←</span> Geri Dön
            </button>

            <div className="content-wrapper">
                <div className="image-container">
                    <div className="image-wrapper">
                        <img src={book.coverUrl} alt={book.title} className="book-image" />
                    </div>
                </div>

                <div className="info-container">
                    <h1 className="title">{book.title}</h1>
                    <p className="author">
                        <span className="author-label">Yazar:</span> {book.authors?.join(", ") || "Bilinmiyor"}
                    </p>

                    <div className="meta-info">
                        <span className="meta-badge">📄 {book.pageCount} Sayfa</span>
                        <span className="meta-badge">📅 {book.publishedDate}</span>
                    </div>

                    <div className="rating-container">
                        <h4 className="rating-title">Puanınız</h4>
                        <StarRating rating={userRating} onRate={handleRate} />
                    </div>

                    <div className="description-container">
                        <h3 className="section-title">Kitap Hakkında</h3>
                        <div
                            className="description"
                            dangerouslySetInnerHTML={{ __html: book.description || "Açıklama bulunmuyor." }}
                        />
                    </div>

                    <div className="button-container">
                        <button onClick={() => addToLibrary("Read")} className="read-button">
                            ✅ Okudum
                        </button>
                        <button onClick={() => addToLibrary("PlanToRead")} className="plan-button">
                            📖 Listeme Ekle
                        </button>
                        <button onClick={() => setIsListModalOpen(true)} className="list-button">
                            📂 Özel Listeye Ekle
                        </button>
                    </div>
                </div>
            </div>

            <ReviewSection googleId={book.id} />
            {book.id && (
                <ListSelector isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} googleId={book.id} />
            )}
        </div>
    );
}

export default BookDetail;