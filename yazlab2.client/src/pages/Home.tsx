import { useEffect, useState } from "react";
import axios from "axios";
import type { Movie } from "../types"; 
import { useNavigate } from "react-router-dom";

function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Sayfa açılınca filmleri çek
        const fetchMovies = async () => {
            try {
                // Proxy ayarımız sayesinde direkt /api diyebiliyoruz
                const response = await axios.get("/api/movies/popular");
                setMovies(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Film çekme hatası:", error);
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Çıkış Yap Fonksiyonu
    const handleLogout = () => {
        localStorage.removeItem("token"); // Bileti yırt
        navigate("/login"); // Girişe at
    };

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Yükleniyor...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>Popüler Filmler</h1>
                <button onClick={handleLogout} style={{ padding: "10px", backgroundColor: "#ff4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Çıkış Yap
                </button>
            </div>

            {/* Film Grid Yapısı */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px"
            }}>
                {movies.map((movie) => (
                    <div key={movie.id} style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>

                        {/* Film Posteri */}
                        <img
                            src={movie.posterPath}
                            alt={movie.title}
                            style={{ width: "100%", height: "300px", objectFit: "cover" }}
                        />

                        {/* Film Bilgileri */}
                        <div style={{ padding: "10px" }}>
                            <h3 style={{ fontSize: "16px", margin: "0 0 10px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {movie.title}
                            </h3>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#666" }}>
                                <span>⭐ {movie.voteAverage.toFixed(1)}</span>
                                <span>📅 {movie.releaseDate.split("-")[0]}</span>
                            </div>

                            <button style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                Detaylar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;