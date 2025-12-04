import { useEffect, useState } from "react";
import api from "../api";

interface CustomList {
  id: number;
  name: string;
  itemCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tmdbId?: number;      
  googleId?: string;   
}

function ListSelector({ isOpen, onClose, tmdbId, googleId }: Props) {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/customlist/my-lists");
      setLists(res.data);
    } catch (error) {
      console.error("Listeler çekilemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (listId: number) => {
    try {
      await api.post("/api/customlist/add-item", {
        listId: listId,
        tmdbId: tmdbId || null,
        googleId: googleId || null
      });
      alert("Eklendi!");
      onClose(); 
    } catch (error: any) {
      alert(error.response?.data || "Hata oluştu (Zaten ekli olabilir).");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "300px", maxWidth: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Hangi listeye?</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
        </div>

        {loading ? <p>Yükleniyor...</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {lists.length === 0 && <p style={{color: "#999"}}>Henüz hiç listen yok. Profilinden oluşturabilirsin.</p>}
                
                {lists.map(list => (
                    <button 
                        key={list.id} 
                        onClick={() => handleAdd(list.id)}
                        style={{ padding: "10px", textAlign: "left", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "5px", cursor: "pointer" }}
                    >
                        📂 {list.name} <span style={{fontSize: "12px", color: "#666"}}>({list.itemCount} öğe)</span>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default ListSelector;