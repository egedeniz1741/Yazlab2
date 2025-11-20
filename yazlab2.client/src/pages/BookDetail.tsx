import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // BİZİM GÜVENLİ API
import type { Book } from "../types";

function BookDetail() {
  const { id } = useParams(); // URL'den ID'yi al (örn: "zyTCAlFPjgYC")
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Kitap detayı çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Kütüphaneye Ekleme Fonksiyonu
  const addToLibrary = async (status: string) => {
    if (!book) return;
    
    try {
      await api.post("/api/library/add-book", {
        googleId: book.id, // Google ID'si
        status: status     // "Read" veya "PlanToRead"
      });
      alert(status === "Read" ? "Kitap 'Okudum' listesine eklendi!" : "Kitap okuma listene eklendi!");
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu. Giriş yaptığından emin ol.");
    }
  };

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Yükleniyor...</div>;
  if (!book) return <div style={{textAlign: "center"}}>Kitap bulunamadı!</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "20px", padding: "8px 15px", cursor: "pointer" }}
      >
        ← Geri Dön
      </button>

      <div style={{ display: "flex", gap: "40px", flexDirection: "row", flexWrap: "wrap" }}>
        {/* Sol: Kapak Resmi */}
        <div style={{ flexShrink: 0 }}>
             <img 
              src={book.coverUrl} 
              alt={book.title} 
              style={{ width: "250px", borderRadius: "5px", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }} 
            />
        </div>

        {/* Sağ: Bilgiler */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 10px 0" }}>{book.title}</h1>
          
          <p style={{ fontSize: "18px", color: "#555", fontStyle: "italic" }}>
            Yazar: {book.authors?.join(", ") || "Bilinmiyor"}
          </p>

          <div style={{ margin: "20px 0", fontSize: "14px", color: "#666" }}>
            <span>📄 {book.pageCount} Sayfa</span>
            <span style={{ marginLeft: "20px" }}>📅 {book.publishedDate}</span>
          </div>

          <h3>Özet</h3>
          {/* Google bazen HTML tagleri gönderir (örn: <p>...), onları temizlemek yerine basitçe gösteriyoruz */}
          <div 
            style={{ lineHeight: "1.6", maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}
            dangerouslySetInnerHTML={{ __html: book.description || "Açıklama bulunmuyor." }}
          />

          {/* Aksiyon Butonları */}
          <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
            <button 
                onClick={() => addToLibrary("Read")}
                style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
            >
              ✅ Okudum
            </button>
            <button 
                onClick={() => addToLibrary("PlanToRead")}
                style={{ padding: "12px 24px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
            >
              📖 Listeme Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;