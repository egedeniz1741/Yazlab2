import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import type { Movie, FeedItem, Book } from "../types";
import FeedCard from "../components/FeedCard";
import Showcase from "../components/Showcase";

interface Genre { id: number; name: string; }

function Home() {
    const navigate = useNavigate();

   
    const [activeTab, setActiveTab] = useState("feed");
    const [loading, setLoading] = useState(false);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [feed, setFeed] = useState<FeedItem[]>([]);

    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);

  
    const [feedPage, setFeedPage] = useState(1);
    const [hasMoreFeed, setHasMoreFeed] = useState(true);
    const [moviePage, setMoviePage] = useState(1);
    const [hasMoreMovies, setHasMoreMovies] = useState(true);
    const [bookPage, setBookPage] = useState(1);
    const [hasMoreBooks, setHasMoreBooks] = useState(true);

   
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<number | "">("");
    const [selectedYear, setSelectedYear] = useState<number | "">("");
    const [minRating, setMinRating] = useState<number>(0);

  
    const [bQuery, setBQuery] = useState("");
    const [bGenre, setBGenre] = useState("");
    const [bYear, setBYear] = useState<number | "">("");
    const bookGenres = ["Fiction", "Fantasy", "History", "Romance", "Horror", "Science", "Mystery"];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        if (genres.length === 0) {
            api.get("/api/movies/genres").then(res => setGenres(res.data)).catch(console.error);
        }

     
        if (popularMovies.length === 0) loadShowcaseData();

        if (activeTab === "feed") {
            if (feed.length === 0) { setFeedPage(1); setHasMoreFeed(true); loadFeed(1); }
        } else if (activeTab === "movies") {
            if (movies.length === 0) { setMoviePage(1); setHasMoreMovies(true); loadMovies(1); }
        } else if (activeTab === "books") {
            if (books.length === 0) { setBookPage(1); setHasMoreBooks(true); loadBooks(1); }
        }
    }, [activeTab]);

    const loadShowcaseData = () => {
        api.get("/api/analytics/popular-movies").then(res => setPopularMovies(res.data));
        api.get("/api/analytics/top-rated-movies").then(res => setTopRatedMovies(res.data));
        api.get("/api/analytics/popular-books").then(res => setPopularBooks(res.data));
    };

    const loadFeed = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/social/feed?page=${pageNum}`);
            if (res.data.length === 0) setHasMoreFeed(false);
            else pageNum === 1 ? setFeed(res.data) : setFeed(prev => [...prev, ...res.data]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const loadMovies = async (pageNum: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedGenre) params.append("genreId", selectedGenre.toString());
            if (selectedYear) params.append("year", selectedYear.toString());
            if (minRating > 0) params.append("minRating", minRating.toString());
            params.append("page", pageNum.toString());

            const endpoint = (selectedGenre || selectedYear || minRating > 0)
                ? `/api/movies/discover?${params.toString()}`
                : `/api/movies/popular?page=${pageNum}`;

            const res = await api.get(endpoint);
            if (res.data.length === 0) setHasMoreMovies(false);
            else pageNum === 1 ? setMovies(res.data) : setMovies(prev => [...prev, ...res.data]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

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

    const applyFilters = () => { setMoviePage(1); setHasMoreMovies(true); loadMovies(1); };
    const clearFilters = () => { setSelectedGenre(""); setSelectedYear(""); setMinRating(0); setMoviePage(1); setHasMoreMovies(true); setTimeout(() => loadMovies(1), 50); };

    const applyBookFilters = () => { setBookPage(1); setHasMoreBooks(true); loadBooks(1); };
    const clearBookFilters = () => { setBQuery(""); setBGenre(""); setBYear(""); setBookPage(1); setHasMoreBooks(true); setTimeout(() => loadBooks(1), 50); };

    const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", color: "#e4e4e7" }}>

           
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", background: "linear-gradient(to right, #a855f7, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    MyFilm&BookArchive
                </h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => navigate("/social")} style={navBtnStyle}>👥 Arkadaş Bul</button>
                    
                    <button onClick={() => setActiveTab("books")} style={navBtnStyle}>📚 Kitap Ara</button>
                    <button onClick={() => navigate("/profile")} style={navBtnStyle}>👤 Profilim</button>
                    <button onClick={handleLogout} style={{ ...navBtnStyle, backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid #ef4444" }}>Çıkış</button>
                </div>
            </div>

          
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", borderBottom: "1px solid #3f3f46" }}>
                <button onClick={() => setActiveTab("feed")} style={tabStyle(activeTab === "feed")}>📱 Sosyal Akış</button>
                <button onClick={() => setActiveTab("movies")} style={tabStyle(activeTab === "movies")}>🎬 Filmleri Keşfet</button>
                <button onClick={() => setActiveTab("books")} style={tabStyle(activeTab === "books")}>📚 Kitapları Keşfet</button>
            </div>

          

            {activeTab === "feed" && (
                <div>
                    {feed.length === 0 && !loading ? (
                        <div style={{ textAlign: "center", padding: "50px", color: "#a1a1aa" }}>
                            <h2>Akışınız boş! 😴</h2>
                            <p>Arkadaşlarınızı takip ederek başlayın.</p>
                            <button onClick={() => navigate("/social")} style={{ marginTop: "15px", padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Arkadaş Bul</button>
                        </div>
                    ) : (
                        <div>
                            {feed.map((item, index) => <FeedCard key={`${item.user}-${index}`} item={item} />)}
                            {hasMoreFeed && (
                                <div style={{ textAlign: "center", margin: "30px 0" }}>
                                    <button onClick={() => { setFeedPage(p => p + 1); loadFeed(feedPage + 1); }} disabled={loading} style={loadMoreBtnStyle}>{loading ? "..." : "⬇️ Daha Fazla"}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

           
            {activeTab === "movies" && (
                <div>
                    <Showcase title="🔥 En Popüler Filmler" items={popularMovies} type="movie" />
                    <Showcase title="⭐ En Yüksek Puanlılar" items={topRatedMovies} type="movie" />
                    <hr style={{ border: "0", borderTop: "1px solid #3f3f46", margin: "40px 0" }} />

                    <div style={filterPanelStyle}>
                        <div>
                            <label style={labelStyle}>Film Adı (Opsiyonel)</label>
                            <input type="text" placeholder="Ara..." disabled style={{ ...inputStyle, opacity: 0.5 }} title="Film arama şu an discover API ile çakışıyor, filtreleri kullanın" />
                        </div>
                        <div>
                            <label style={labelStyle}>Tür</label>
                            <select value={selectedGenre} onChange={e => setSelectedGenre(Number(e.target.value) || "")} style={inputStyle}>
                                <option value="">Tümü</option>
                                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Yıl</label>
                            <input type="number" placeholder="2023" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value) || "")} style={{ ...inputStyle, width: "100px" }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Min Puan: {minRating}</label>
                            <input type="range" min="0" max="10" step="1" value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={{ width: "150px", cursor: "pointer", accentColor: "#3b82f6" }} />
                        </div>
                        <button onClick={applyFilters} style={{ ...filterBtnStyle, backgroundColor: "#3b82f6" }}>Filtrele</button>
                        <button onClick={clearFilters} style={{ ...filterBtnStyle, backgroundColor: "#52525b" }}>Temizle</button>
                    </div>

                    <div style={gridStyle}>
                        {movies.map((movie) => (
                            <div key={movie.id} style={cardStyle}>
                                <img src={movie.posterPath} alt={movie.title} style={posterStyle} />
                                <div style={{ padding: "15px" }}>
                                    <h3 style={titleStyle} title={movie.title}>{movie.title}</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#a1a1aa" }}>
                                        <span style={{ fontWeight: "bold", color: "#fbbf24" }}>★ {movie.voteAverage.toFixed(1)}</span>
                                        <span>{movie.releaseDate?.split("-")[0]}</span>
                                    </div>
                                    <button onClick={() => navigate(`/movie/${movie.id}`)} style={detailBtnStyle}>Detaylar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreMovies && (
                        <div style={{ textAlign: "center", margin: "40px 0" }}>
                            <button onClick={() => { setMoviePage(p => p + 1); loadMovies(moviePage + 1); }} disabled={loading} style={loadMoreBtnStyle}>{loading ? "..." : "⬇️ Daha Fazla Film"}</button>
                        </div>
                    )}
                </div>
            )}

            
            {activeTab === "books" && (
                <div>
                    <Showcase title="📚 En Çok Okunan Kitaplar" items={popularBooks} type="book" />
                    <hr style={{ border: "0", borderTop: "1px solid #3f3f46", margin: "40px 0" }} />

                    <div style={{ ...filterPanelStyle, borderLeft: "5px solid #22c55e" }}>
                        <div>
                            <label style={labelStyle}>Kitap Adı</label>
                            <input type="text" placeholder="Harry Potter..." value={bQuery} onChange={e => setBQuery(e.target.value)} style={{ ...inputStyle, width: "200px" }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tür</label>
                            <select value={bGenre} onChange={e => setBGenre(e.target.value)} style={inputStyle}>
                                <option value="">Tümü</option>
                                {bookGenres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Yıl</label>
                            <input type="number" placeholder="2000" value={bYear} onChange={e => setBYear(Number(e.target.value) || "")} style={{ ...inputStyle, width: "80px" }} />
                        </div>
                        <button onClick={applyBookFilters} style={{ ...filterBtnStyle, backgroundColor: "#22c55e" }}>Ara</button>
                        <button onClick={clearBookFilters} style={{ ...filterBtnStyle, backgroundColor: "#52525b" }}>Temizle</button>
                    </div>

                    <div style={gridStyle}>
                        {books.map((book) => (
                            <div key={book.id} style={cardStyle}>
                                <img src={book.coverUrl} style={{ ...posterStyle, objectFit: "contain", backgroundColor: "#eee" }} />
                                <div style={{ padding: "15px" }}>
                                    <h3 style={titleStyle} title={book.title}>{book.title}</h3>
                                    <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "0 0 5px 0" }}>{book.authors?.[0]}</p>
                                    <button onClick={() => navigate(`/book/${book.id}`)} style={{ ...detailBtnStyle, backgroundColor: "#22c55e" }}>Detaylar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMoreBooks && (
                        <div style={{ textAlign: "center", margin: "40px 0" }}>
                            <button onClick={() => { setBookPage(p => p + 1); loadBooks(bookPage + 1); }} disabled={loading} style={loadMoreBtnStyle}>{loading ? "..." : "⬇️ Daha Fazla Kitap"}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


const navBtnStyle = { padding: "8px 16px", backgroundColor: "#27272a", color: "#e4e4e7", border: "1px solid #3f3f46", borderRadius: "8px", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" };
const tabStyle = (isActive: boolean) => ({ padding: "15px 30px", background: "none", border: "none", borderBottom: isActive ? "3px solid #3b82f6" : "3px solid transparent", fontWeight: "bold", fontSize: "16px", cursor: "pointer", color: isActive ? "#3b82f6" : "#a1a1aa" });
const filterPanelStyle = { backgroundColor: "#27272a", padding: "25px", borderRadius: "15px", marginBottom: "30px", display: "flex", gap: "15px", flexWrap: "wrap" as "wrap", alignItems: "flex-end", border: "1px solid #3f3f46" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "8px", color: "#a1a1aa" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #3f3f46", backgroundColor: "#18181b", color: "white", minWidth: "150px" };
const filterBtnStyle = { padding: "10px 25px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", height: "40px" };
const loadMoreBtnStyle = { padding: "12px 30px", backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "25px", cursor: "pointer", color: "#e4e4e7", fontWeight: "bold", fontSize: "14px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "25px" };
const cardStyle = { border: "1px solid #3f3f46", borderRadius: "12px", overflow: "hidden", backgroundColor: "#27272a", transition: "transform 0.2s", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
const posterStyle = { width: "100%", height: "300px", objectFit: "cover" as "cover" };
const titleStyle = { fontSize: "16px", margin: "0 0 10px 0", whiteSpace: "nowrap" as "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#e4e4e7" };
const detailBtnStyle = { width: "100%", marginTop: "15px", padding: "8px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };

export default Home;