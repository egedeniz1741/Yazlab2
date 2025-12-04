import { useState } from "react";
import api from "../api";
import type { Book } from "../types";
import { useNavigate } from "react-router-dom";

function Books() {
    const [query, setQuery] = useState("");
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

   
    const handleSearch = async (e: any) => {
        e.preventDefault();
        if (!query.trim()) return;

        setBooks([]);
        setPage(1);
        setHasMore(true);
        fetchBooks(1); 
    };


    const fetchBooks = async (pageNum: number) => {
        setLoading(true);
        try {
            
            const response = await api.get(`/api/books/search?query=${query}&page=${pageNum}`);

            if (response.data.length === 0) {
                setHasMore(false);
            } else {
                if (pageNum === 1) setBooks(response.data);
                else setBooks(prev => [...prev, ...response.data]); 
            }
        } catch (error) {
            console.error("Kitap arama hatası:", error);
            alert("Kitap aranırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
           
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h1 style={{ color: "#333" }}>Kitap Keşfet</h1>

                <form onSubmit={handleSearch} style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Kitap adı yazın (Örn: Harry Potter)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ padding: "12px", width: "300px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                    />
                    <button type="submit" style={{ padding: "12px 25px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
                        Ara
                    </button>
                </form>

                <div style={{ marginTop: "15px" }}>
                    <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}>← Ana Sayfaya Dön</button>
                </div>
            </div>

            {loading && page === 1 && <div style={{ textAlign: "center" }}>Aranıyor...</div>}

       
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px"
            }}>
                {books.map((book) => (
                    <div key={book.id} style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", backgroundColor: "white" }}>

                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            style={{ width: "100%", height: "250px", objectFit: "contain", backgroundColor: "#f9f9f9", padding: "10px" }}
                        />

                        <div style={{ padding: "10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <h3 style={{ fontSize: "16px", margin: "0 0 5px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={book.title}>
                                    {book.title}
                                </h3>
                                <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>
                                    {book.authors && book.authors.length > 0 ? book.authors[0] : "Bilinmeyen Yazar"}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate(`/book/${book.id}`)}
                                style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                            >
                                Detaylar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && books.length === 0 && query !== "" && page === 1 && (
                <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>Aramanızla eşleşen kitap bulunamadı.</p>
            )}

            
            {hasMore && books.length > 0 && (
                <div style={{ textAlign: "center", margin: "40px 0" }}>
                    <button
                        onClick={() => {
                            const next = page + 1;
                            setPage(next);
                            fetchBooks(next);
                        }}
                        disabled={loading}
                        style={{ padding: "12px 30px", backgroundColor: "#e9ecef", border: "none", borderRadius: "25px", cursor: "pointer", color: "#495057", fontWeight: "bold", fontSize: "14px" }}
                    >
                        {loading ? "Yükleniyor..." : "⬇️ Daha Fazla Kitap"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Books;