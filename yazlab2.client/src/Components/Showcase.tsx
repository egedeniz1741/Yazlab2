import { useNavigate } from "react-router-dom";

interface Item {
    id: number;
    tmdbId?: string;   
    googleBookId?: string; 
    title: string;
    posterUrl?: string;
    coverUrl?: string;
    platformCount?: number; 
    platformRating?: number; 
}

interface Props {
    title: string;
    items: Item[];
    type: "movie" | "book";
}

function Showcase({ title, items, type }: Props) {
    const navigate = useNavigate();

    if (items.length === 0) return null; 

    return (
        <div style={{ marginBottom: "40px" }}>
            <h2 style={{ borderLeft: "5px solid #007bff", paddingLeft: "10px", marginBottom: "15px", color: "#333" }}>
                {title}
            </h2>

          
            <div style={{
                display: "flex",
                gap: "15px",
                overflowX: "auto",
                paddingBottom: "15px",
                scrollBehavior: "smooth"
            }}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(type === "movie" ? `/movie/${item.tmdbId}` : `/book/${item.googleBookId}`)}
                        style={{
                            minWidth: "160px",
                            maxWidth: "160px",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            position: "relative"
                        }}
                    >
                        <img
                            src={type === "movie" ? item.posterUrl : item.coverUrl}
                            alt={item.title}
                            style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                        />

                 
                        {(item.platformCount || item.platformRating) && (
                            <div style={{
                                position: "absolute", top: "10px", right: "10px",
                                backgroundColor: "rgba(0,0,0,0.8)", color: "#fff",
                                padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold"
                            }}>
                                {item.platformCount ? `🔥 ${item.platformCount}` : `⭐ ${item.platformRating?.toFixed(1)}`}
                            </div>
                        )}

                        <h4 style={{ margin: "10px 0 0 0", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                        </h4>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Showcase;