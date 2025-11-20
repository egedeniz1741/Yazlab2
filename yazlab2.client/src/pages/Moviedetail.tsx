import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // BİZİM API
import type { Movie } from "../types";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // api.get kullan
        const response = await api.get(`/api/movies/${id}`);
        setMovie(response.data);
      } catch (error) {
        console.error("Detay çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const addToLibrary = async (status: string) => {
    if (!movie) return;
    try {
        // api.post kullan
        await api.post("/api/library/add-movie", {
            tmdbId: movie.id,
            status: status
        });
        alert(status === "Watched" ? "Film 'İzledim' listesine eklendi!" : "Film listene eklendi!");
    } catch (error) {
        console.error(error);
        alert("Bir hata oluştu. Giriş yaptığından emin ol.");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!movie) return <div>Film bulunamadı!</div>;

  return (
    // ... (Return kısmı aynı kalacak, sadece butonların olduğu kısım)
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>← Geri Dön</button>
        
        <div style={{ display: "flex", gap: "30px" }}>
            <img src={movie.posterPath} alt={movie.title} style={{ width: "300px", borderRadius: "10px" }} />
            <div>
                <h1>{movie.title}</h1>
                <p>{movie.overview}</p>
                <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
                    <button onClick={() => addToLibrary("Watched")} style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", borderRadius: "5px" }}>İzledim</button>
                    <button onClick={() => addToLibrary("PlanToWatch")} style={{ padding: "10px 20px", backgroundColor: "#2196F3", color: "white", borderRadius: "5px" }}>Listeme Ekle</button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default MovieDetail;