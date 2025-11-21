import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import type { Movie, FeedItem, Book } from "../types"; // Book tipini de ekledik
import FeedCard from "../components/FeedCard";
import Showcase from "../components/Showcase";

// Tür verisi için arayüz
interface Genre {
    id: number;
    name: string;
}

function Home() {
    const navigate = useNavigate();

    // --- STATE'LER ---
    const [activeTab, setActiveTab] = useState("feed"); // 'feed', 'movies', 'books'
    const [loading, setLoading] = useState(false);

    // Veri State'leri
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [books, setBooks] = useState<Book[]>([]);

    // Vitrin State'leri
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);

    // Sayfalama State'leri
    const [feedPage, setFeedPage] = useState(1);
    const [hasMoreFeed, setHasMoreFeed] = useState(true);

    const [moviePage, setMoviePage] = useState(1);
    const [hasMoreMovies, setHasMoreMovies] = useState(true);

    const [bookPage, setBookPage] = useState(1);
    const [hasMoreBooks, setHasMoreBooks] = useState(true);

    // --- FİLM FİLTRELERİ ---
    const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
    const [mQuery, setMQuery] = useState(""); // Film Adı
    const [mGenre, setMGenre] = useState<number | "">("");
    const [mYear, setMYear] = useState<number | "">("");
    const [mRating, setMRating] = useState<number>(0);

    // --- KİTAP FİLTRELERİ ---
    const [bQuery, setBQuery] = useState(""); // Kitap Adı
    const [bGenre, setBGenre] = useState(""); // Kitap Türü (Subject)
    const [bYear, setBYear] = useState<number | "">("");

    // Kitap Türleri (Google Books için manuel liste)
    const bookGenres = ["Fiction", "Fantasy", "History", "Romance", "Horror", "Science", "Mystery", "Poetry"];

    // --- ETKİLEŞİMLER ---

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        // Film Türlerini Çek
        if (movieGenres.length === 0) {
            api.get("/api/movies/genres").then(res => setMovieGenres(res.data)).catch(() => { });
        }

        // Vitrin Verilerini Çek (Sadece bir kere)
        if (popularMovies.length === 0) {
            api.get("/api/analytics/popular-movies").then(res => setPopularMovies(res.data));
            api.get("/api/analytics/top-rated-movies").then(res => setTopRatedMovies(res.data));
            api.get("/api/analytics/popular-books").then(res => setPopularBooks(res.data));
        }

        // Tab Değişimi Yönetimi
        if (activeTab === "feed") {
            if (feed.length === 0) loadFeed(1);
        } else if (activeTab === "movies") {
            if (movies.length === 0) loadMovies(1);
        } else if (activeTab === "books") {
            if (books.length === 0) loadBooks(1);
        }

    }, [activeTab]);

    // --- FEED YÜKLEME ---
    const loadFeed = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/social/feed?page=${pageNum}`);
            if (res.data.length === 0) setHasMoreFeed(false);
            else pageNum === 1 ? setFeed(res.data) : setFeed(prev => [...prev, ...res.data]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // --- FİLM YÜKLEME ---
    const loadMovies = async (pageNum: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (mQuery) params.append("query", mQuery); // İsimle Arama
            if (mGenre) params.append("genreId", mGenre.toString());
            if (mYear) params.append("year", mYear.toString());
            if (mRating > 0) params.append("minRating", mRating.toString());
            params.append("page", pageNum.toString());

            const res = await api.get(`/api/movies/discover?${params.toString()}`);

            if (res.data.length === 0) setHasMoreMovies(false);
            else pageNum === 1 ? setMovies(res.data) : setMovies(prev => [...prev, ...res.data]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // --- KİTAP YÜKLEME ---
    const loadBooks = async (pageNum: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (bQuery) params.append("query", bQuery);
            if (bGenre) params.append("genre", bGenre);
            if (bYear) params.append("year", bYear.toString());
            params.append("page", pageNum.toString());

            const res = await api.get(`/api/books/search?${params.toString()}`);

            if (res.data.length === 0) setHasMoreBooks(false);
            else pageNum === 1 ? setBooks(res.data) : setBooks(prev => [...prev, ...res.data]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // --- FİLTRE AKSİYONLARI ---
    const applyMovieFilters = () => { setMoviePage(1); setHasMoreMovies(true); loadMovies(1); };
    const clearMovieFilters = () => { setMQuery(""); setMGenre(""); setMYear(""); setMRating(0); setTimeout(() => { setMoviePage(1); loadMovies(1); }, 50); };

    const applyBookFilters = () => { setBookPage(1); setHasMoreBooks(true); loadBooks(1); };
    const clearBookFilters = () => { setBQuery(""); setBGenre(""); setBYear(""); setTimeout(() => { setBookPage(1); loadBooks(1); }, 50); };

    const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>

            {/* ÜST BAŞLIK */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1 style={{ margin: 0, color: "#333" }}>Sosyal Kütüphane</h1>
                <div>
                    <button onClick={() => navigate("/social")} style={headerBtnStyle("#17a2b8")}>👥 Arkadaş Bul</button>
                    <button onClick={() => navigate("/profile")} style={headerBtnStyle("#6c757d")}>👤 Profilim</button>
                    <button onClick={handleLogout} style={headerBtnStyle("#ff4444")}>Çıkış</button>
                </div>
            </div>

            {/* SEKMELER (3 Tane Oldu) */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", borderBottom: "1px solid #ccc" }}>
                <button onClick={() => setActiveTab("feed")} style={tabStyle(activeTab === "feed")}>📱 Sosyal Akış</button>
                <button onClick={() => setActiveTab("movies")} style={tabStyle(activeTab === "movies")}>🎬 Filmleri Keşfet</button>
                <button onClick={() => setActiveTab("books")} style={tabStyle(activeTab === "books")}>📚 Kitapları Keşfet</button>
            </div>

            {/* --- 1. SOSYAL AKIŞ --- */}
            {activeTab === "feed" && (
                <div>
                    {/* VİTRİN (Sadece Feed sekmesinde veya Movies sekmesinde tutabilirsin, burada Feed'in üstünde kalsın) */}
                    <Showcase title="🔥 Platformun En Popüler Filmleri" items={popularMovies} type="movie" />
                    <Showcase title="⭐ En Yüksek Puanlı Filmler" items={topRatedMovies} type="movie" />
                    <Showcase title="📚 En Çok Okunan Kitaplar" items={popularBooks} type="book" />
                    <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />

                    {feed.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                            <h2>Akışınız boş!</h2>
                            <button onClick={() => navigate("/social")} style={{ marginTop: "10px", padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>Arkadaş Bul</button>
                        </div>
                    ) : (
                        <div>
                            {feed.map((item, index) => <FeedCard key={`${item.user}-${index}`} item={item} />)}
                            {hasMoreFeed && (
                                <div style={{ textAlign: "center", margin: "20px" }}>
                                    <button onClick={() => { setFeedPage(p => p + 1); loadFeed(feedPage + 1); }} disabled={loading} style={loadMoreBtnStyle}>
                                        {loading ? "..." : "⬇️ Daha Fazla"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* --- 2. FİLMLERİ KEŞFET --- */}
            {activeTab === "movies" && (
                <div>
                    {/* FİLM FİLTRE PANELİ */}
                    <div style={filterContainerStyle}>
                        <div>
                            <label style={labelStyle}>Film Adı</label>
                            <input type="text" placeholder="Matrix..." value={mQuery} onChange={e => setMQuery(e.target.value)} style={{ ...inputStyle, width: "200px" }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tür</label>
                            <select value={mGenre} onChange={e => setMGenre(Number(e.target.value) || "")} style={inputStyle}>
                                <option value="">Tümü</option>
                                {movieGenres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Yıl</label>
                            <input type="number" placeholder="2023" value={mYear} onChange={e => setMYear(Number(e.target.value) || "")} style={{ ...inputStyle, width: "80px" }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Min Puan: {mRating}</label>
                            <input type="range" min="0" max="10" value={mRating} onChange={e => setMRating(Number(e.target.value))} style={{ width: "100px", cursor: "pointer" }} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={applyMovieFilters} style={{ ...filterBtnStyle, backgroundColor: "#007bff" }}>Ara / Filtrele</button>
                            <button onClick={clearMovieFilters} style={{ ...filterBtnStyle, backgroundColor: "#6c757d" }}>Temizle</button>
                        </div>
                    </div>

                    {/* FİLM LİSTESİ */}
                    <div style={gridStyle}>
                        {movies.map((movie) => (
                            <div key={movie.id} style={cardStyle}>
                                <img src={movie.posterPath} style={posterStyle} />
                                <div style={{ padding: "10px" }}>
                                    <h3 style={titleStyle} title={movie.title}>{movie.title}</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666" }}>
                                        <span style={{ fontWeight: "bold", color: "#f57c00" }}>★ {movie.voteAverage.toFixed(1)}</span>
                                        <span>{movie.releaseDate?.split("-")[0]}</span>
                                    </div>
                                    <button onClick={() => navigate(`/movie/${movie.id}`)} style={detailBtnStyle}>Detaylar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreMovies && movies.length > 0 && (
                        <div style={{ textAlign: "center", margin: "30px 0" }}>
                            <button onClick={() => { setMoviePage(p => p + 1); loadMovies(moviePage + 1); }} disabled={loading} style={loadMoreBtnStyle}>
                                {loading ? "..." : "⬇️ Daha Fazla Film"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- 3. KİTAPLARI KEŞFET --- */}
            {activeTab === "books" && (
                <div>
                    {/* KİTAP FİLTRE PANELİ */}
                    <div style={{ ...filterContainerStyle, borderLeft: "5px solid #28a745" }}>
                        <div>
                            <label style={labelStyle}>Kitap Adı</label>
                            <input type="text" placeholder="Harry Potter..." value={bQuery} onChange={e => setBQuery(e.target.value)} style={{ ...inputStyle, width: "200px" }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tür (Konu)</label>
                            <select value={bGenre} onChange={e => setBGenre(e.target.value)} style={inputStyle}>
                                <option value="">Tümü</option>
                                {bookGenres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Yıl</label>
                            <input type="number" placeholder="2000" value={bYear} onChange={e => setBYear(Number(e.target.value) || "")} style={{ ...inputStyle, width: "80px" }} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={applyBookFilters} style={{ ...filterBtnStyle, backgroundColor: "#28a745" }}>Ara / Filtrele</button>
                            <button onClick={clearBookFilters} style={{ ...filterBtnStyle, backgroundColor: "#6c757d" }}>Temizle</button>
                        </div>
                    </div>

                    {/* KİTAP LİSTESİ */}
                    <div style={gridStyle}>
                        {books.map((book) => (
                            <div key={book.id} style={cardStyle}>
                                <img src={book.coverUrl} style={{ ...posterStyle, objectFit: "contain", backgroundColor: "#eee" }} />
                                <div style={{ padding: "10px" }}>
                                    <h3 style={titleStyle} title={book.title}>{book.title}</h3>
                                    <p style={{ fontSize: "12px", color: "#666", margin: "0 0 5px 0" }}>{book.authors?.[0] || "Yazar Yok"}</p>
                                    <button onClick={() => navigate(`/book/${book.id}`)} style={{ ...detailBtnStyle, backgroundColor: "#28a745" }}>Detaylar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreBooks && books.length > 0 && (
                        <div style={{ textAlign: "center", margin: "30px 0" }}>
                            <button onClick={() => { setBookPage(p => p + 1); loadBooks(bookPage + 1); }} disabled={loading} style={loadMoreBtnStyle}>
                                {loading ? "..." : "⬇️ Daha Fazla Kitap"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// --- STİLLER ---
const headerBtnStyle = (bgColor: string) => ({
    marginRight: "5px", padding: "8px 12px", backgroundColor: bgColor, color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "14px"
});
const tabStyle = (isActive: boolean) => ({
    padding: "15px 20px", background: "none", border: "none", borderBottom: isActive ? "4px solid #007bff" : "4px solid transparent", fontWeight: "bold", fontSize: "16px", cursor: "pointer", color: isActive ? "#007bff" : "#555"
});
const filterContainerStyle = {
    backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap" as "wrap", alignItems: "flex-end", border: "1px solid #e9ecef"
};
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" };
const inputStyle = { padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "120px" };
const filterBtnStyle = { padding: "8px 20px", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", height: "35px" };
const loadMoreBtnStyle = { padding: "10px 30px", backgroundColor: "#e9ecef", border: "none", borderRadius: "20px", cursor: "pointer", color: "#495057", fontWeight: "bold", fontSize: "14px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" };
const cardStyle = { border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", backgroundColor: "white" };
const posterStyle = { width: "100%", height: "270px", objectFit: "cover" as "cover" };
const titleStyle = { fontSize: "15px", margin: "0 0 5px 0", whiteSpace: "nowrap" as "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const detailBtnStyle = { width: "100%", marginTop: "10px", padding: "6px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "13px" };

export default Home;