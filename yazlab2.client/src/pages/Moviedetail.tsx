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
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const movieRes = await api.get(`/api/movies/${id}`);
                setMovie(movieRes.data);
                const statusRes = await api.get(`/api/library/movie-status/${movieRes.data.id}`);
                if (statusRes.data?.rating) setUserRating(statusRes.data.rating);
            } catch (error) { console.error("Hata", error); } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    const addToLibrary = async (status: string, ratingValue?: number) => {
        if (!movie) return;
        try {
            await api.post("/api/library/add-movie", { tmdbId: movie.id, status, rating: ratingValue || userRating });
            if (!ratingValue) alert("Liste güncellendi!");
        } catch (error) { alert("Hata oluştu."); }
    };

    const handleRate = (rate: number) => { setUserRating(rate); addToLibrary("Watched", rate); };

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "#a1a1aa" }}>Yükleniyor...</div>;
    if (!movie) return <div style={{ textAlign: "center", marginTop: "50px", color: "#a1a1aa" }}>Film bulunamadı!</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", color: "#e4e4e7" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer", background: "none", border: "none", color: "#3b82f6" }}>← Geri Dön</button>

            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", backgroundColor: "#27272a", padding: "20px", borderRadius: "15px", border: "1px solid #3f3f46" }}>
                <img src={movie.posterPath} alt={movie.title} style={{ width: "300px", borderRadius: "10px" }} />
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: "0 0 10px 0" }}>{movie.title}</h1>
                    <p style={{ color: "#a1a1aa", fontStyle: "italic" }}>{movie.releaseDate}</p>
                    <div style={{ margin: "20px 0", color: "#fbbf24", fontWeight: "bold", fontSize: "18px" }}>★ {movie.voteAverage.toFixed(1)} / 10</div>

                    <div style={{ marginBottom: "20px" }}><StarRating rating={userRating} onRate={handleRate} /></div>

                    <h3 style={{ fontSize: "18px", borderBottom: "1px solid #3f3f46", paddingBottom: "5px" }}>Özet</h3>
                    <p style={{ lineHeight: "1.6", color: "#d4d4d8" }}>{movie.overview || "Özet yok."}</p>

                    <div style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button onClick={() => addToLibrary("Watched")} style={btnStyle("#22c55e")}>✅ İzledim</button>
                        <button onClick={() => addToLibrary("PlanToWatch")} style={btnStyle("#3b82f6")}>📅 Listeme Ekle</button>
                        <button onClick={() => setIsListModalOpen(true)} style={btnStyle("#a855f7")}>📂 Özel Listeye Ekle</button>
                    </div>
                </div>
            </div>

            <ReviewSection tmdbId={movie.id} />
            <ListSelector isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} tmdbId={movie.id} />
        </div>
    );
}

const btnStyle = (bgColor: string) => ({
    padding: "10px 20px", backgroundColor: bgColor, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
});

export default MovieDetail;