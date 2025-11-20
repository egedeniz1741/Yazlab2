import { useState } from "react";
import api from "../api";
import type { Book } from "../types";
import { useNavigate } from "react-router-dom";

function Books() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: any) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/books/search?query=${query}`);
      setBooks(response.data);
    } catch (error) {
      console.error("Kitap arama hatası:", error);
      alert("Kitap aranırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Üst Kısım: Başlık ve Arama Kutusu */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1>Kitap Keşfet</h1>
        
        <form onSubmit={handleSearch} style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Kitap adı yazın (Örn: Harry Potter)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "10px", width: "300px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Ara
          </button>
        </form>
        
        <div style={{ marginTop: "10px" }}>
            <button onClick={() => navigate("/")} style={{ marginRight: "10px", cursor: "pointer" }}>← Filmlere Dön</button>
        </div>
      </div>

      {loading && <div style={{ textAlign: "center" }}>Aranıyor...</div>}

      {/* Kitap Listesi */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
        gap: "20px" 
      }}>
        {books.map((book) => (
          <div key={book.id} style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            
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
      
      {/* Hiç sonuç yoksa ve arama yapıldıysa */}
      {!loading && books.length === 0 && query !== "" && (
          <p style={{textAlign: "center", color: "#888"}}>Aramanızla eşleşen kitap bulunamadı.</p>
      )}
    </div>
  );
}

export default Books;