import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

interface ListItem {
    id: number;
    type: "Movie" | "Book";
    contentId: string | number;
    title: string;
    image: string;
}

interface ListDetail {
    id: number;
    name: string;
    ownerId: number;
    ownerName: string;
    items: ListItem[];
}

function CustomListDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState<ListDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/customlist/${id}`)
            .then(res => setList(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Yükleniyor...</div>;
    if (!list) return <div style={{ textAlign: "center" }}>Liste bulunamadı.</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer" }}>← Geri Dön</button>

          
            <div style={{ borderBottom: "1px solid #eee", paddingBottom: "20px", marginBottom: "20px" }}>
                <h1 style={{ margin: "0 0 10px 0" }}>📂 {list.name}</h1>
                <p style={{ color: "#666", margin: 0 }}>
                    Oluşturan: <strong style={{ cursor: "pointer", color: "#007bff" }} onClick={() => navigate(`/profile/${list.ownerName}`)}>@{list.ownerName}</strong>
                    • {list.items.length} İçerik
                </p>
            </div>

           
            {list.items.length === 0 ? (
                <p style={{ color: "#999", fontStyle: "italic" }}>Bu listede henüz içerik yok.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" }}>
                    {list.items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(item.type === "Movie" ? `/movie/${item.contentId}` : `/book/${item.contentId}`)}
                            style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", backgroundColor: "white" }}
                        >
                            <img src={item.image} alt={item.title} style={{ width: "100%", height: "240px", objectFit: "cover" }} />
                            <div style={{ padding: "10px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</h4>
                                <span style={{ fontSize: "11px", backgroundColor: "#eee", padding: "2px 6px", borderRadius: "4px", color: "#555" }}>
                                    {item.type === "Movie" ? "Film" : "Kitap"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomListDetail;