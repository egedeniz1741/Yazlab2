import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import type { Movie } from "../types";
import ReviewSection from "../components/ReviewSection";
import ListSelector from "../components/ListSelector";
import StarRating from "../components/StarRating";
import "./MovieDetail.css";

function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const movieRes = await api.get(`/api/movies/${id}`);
                setMovie(movieRes.data);

                const statusRes = await api.get(`/api/library/movie-status/${movieRes.data.id}`);
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
        if (!movie) return;
        try {
            await api.post("/api/library/add-movie", {
                tmdbId: movie.id,
                status: status,
                rating: ratingValue || userRating
            });

            if (ratingValue) {
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
        setUserRating(rate);
        addToLibrary("Watched", rate);
    };

    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (!movie) return <div className="not-found">Film bulunamadı!</div>;

    return (
        <div className="movie-detail-container">
            <button onClick={() => navigate(-1)} className="back-button">
                <span className="back-arrow">←</span> Geri Dön
            </button>

            <div className="content-wrapper">
                <div className="poster-container">
                    <div className="poster-wrapper">
                        <img src={movie.posterPath} alt={movie.title} className="poster" />
                    </div>
                </div>

                <div className="info-container">
                    <h1 className="title">{movie.title}</h1>
                    <p className="release-date">
                        <span className="release-label">Yayın Tarihi:</span> {movie.releaseDate}
                    </p>

                    <div className="vote-container">
                        <div className="vote-box">
                            <span className="vote-star">★</span>
                            <span className="vote-score">{movie.voteAverage.toFixed(1)}</span>
                            <span className="vote-max">/ 10</span>
                        </div>
                        <span className="vote-label">TMDb Puanı</span>
                    </div>

                    <div className="rating-container">
                        <h4 className="rating-title">Sizin Puanınız</h4>
                        <StarRating rating={userRating} onRate={handleRate} />
                    </div>

                    <div className="overview-container">
                        <h3 className="section-title">Film Hakkında</h3>
                        <p className="overview">{movie.overview || "Özet bulunmuyor."}</p>
                    </div>

                    <div className="button-container">
                        <button onClick={() => addToLibrary("Watched")} className="watched-button">
                            ✅ İzledim
                        </button>
                        <button onClick={() => addToLibrary("PlanToWatch")} className="plan-button">
                            📅 Listeme Ekle
                        </button>
                        <button onClick={() => setIsListModalOpen(true)} className="list-button">
                            📂 Özel Listeye Ekle
                        </button>
                    </div>
                </div>
            </div>

            <ReviewSection tmdbId={movie.id} />
            <ListSelector isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} tmdbId={movie.id} />
        </div>
    );
}

export default MovieDetail;