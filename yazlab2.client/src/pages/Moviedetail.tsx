import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import type { Movie } from "../types";
import ReviewSection from "../components/ReviewSection";
import ListSelector from "../components/ListSelector";
import StarRating from "../components/StarRating";

function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(0); // Puan State'i

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Film detayını çek
                const movieRes = await api.get(`/api/movies/${id}`);
                setMovie(movieRes.data);

                // 2. Kullanıcının önceki puanını/durumunu çek (YENİ KISIM)
                // movieRes.data.id, TMDb ID'sidir.
                const statusRes = await api.get(`/api/library/movie-status/${movieRes.data.id}`);
                if (statusRes.data && statusRes.data.rating) {
                    setUserRating(statusRes.data.rating); // Varsa puanı state'e yaz
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
        if (!movie) return;
        try {
            await api.post("/api/library/add-movie", {
                tmdbId: movie.id,
                status: status,
                rating: ratingValue || userRating
            });

            if (ratingValue) {
                // Sadece puan güncellendiyse sessiz kalabiliriz veya ufak uyarı
                console.log("Puan kaydedildi.");
            } else {
                alert(status === "Watched" ? "Film 'İzledim' listesine eklendi!" : "Film izleme listene eklendi!");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        }
    };

    const handleRate = (rate: number) => {
        setUserRating(rate); // Ekranda güncelle
        addToLibrary("Watched", rate); // Veritabanına kaydet
    };

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Yükleniyor...</div>;
    if (!movie) return <div style={{ textAlign: "center" }}>Film bulunamadı!</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer" }}>← Geri Dön</button>

            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                <img src={movie.posterPath} alt={movie.title} style={{ width: "300px", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }} />
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: "0 0 10px 0" }}>{movie.title}</h1>
                    <p style={{ color: "#666", fontStyle: "italic" }}>{movie.releaseDate}</p>
                    <div style={{ margin: "20px 0" }}>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800" }}>★ {movie.voteAverage.toFixed(1)}</span>
                        <span style={{ fontSize: "14px", color: "#999", marginLeft: "10px" }}>/ 10 (Genel)</span>
                    </div>

                    {/* PUANLAMA */}
                    <div style={{ marginBottom: "20px" }}>
                        <StarRating rating={userRating} onRate={handleRate} />
                    </div>

                    <h3>Özet</h3>
                    <p style={{ lineHeight: "1.6" }}>{movie.overview || "Özet bulunmuyor."}</p>

                    <div style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button onClick={() => addToLibrary("Watched")} style={btnStyle("#4CAF50")}>✅ İzledim</button>
                        <button onClick={() => addToLibrary("PlanToWatch")} style={btnStyle("#2196F3")}>📅 Listeme Ekle</button>
                        <button onClick={() => setIsListModalOpen(true)} style={btnStyle("#9c27b0")}>📂 Özel Listeye Ekle</button>
                    </div>
                </div>
            </div>

            <ReviewSection tmdbId={movie.id} />
            <ListSelector isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} tmdbId={movie.id} />
        </div>
    );
}

const btnStyle = (bgColor: string) => ({
    padding: "10px 20px",
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
});

export default MovieDetail;