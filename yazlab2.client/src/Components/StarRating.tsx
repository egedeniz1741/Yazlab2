import { useState } from "react";

interface Props {
    rating: number; 
    onRate: (rating: number) => void; 
}

function StarRating({ rating, onRate }: Props) {
    const [hover, setHover] = useState(0); 

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
            <span style={{ fontWeight: "bold", marginRight: "10px" }}>Puan Ver:</span>
            {[...Array(10)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={starValue}
                        style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            color: starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9", 
                            transition: "color 0.2s"
                        }}
                        onClick={() => onRate(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        ★
                    </span>
                );
            })}
            <span style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}>
                {hover || rating || 0}/10
            </span>
        </div>
    );
}

export default StarRating;