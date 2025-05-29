import { useNavigate } from "react-router-dom";
import { useTestContext } from "../context/TestContext";
import { MdDelete, MdDeleteOutline } from "react-icons/md";
import { HiViewGridAdd } from "react-icons/hi";

export default function Home() {
  const { collections } = useTestContext();
  const { deleteCollection } = useTestContext();
  const navigate = useNavigate();



  const handleDeleteCollection = (name) => {
    if (window.confirm(`Видалити колекцію "${name}"? Це не можна скасувати.`)) {
      deleteCollection(name);
    }
  };

  const handleClick = (name) => {
    navigate("/learn", { state: { selectedCategory: name } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Категорії</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {collections.map((col, i) => (
          <div
            key={i}
            onClick={() => handleClick(col.name)}
            style={{
              flex: "1 1 calc(33.333% - 1rem)",
              backgroundColor: col.color || "#f5f5f5",
              padding: "1.2rem",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              minWidth: "200px",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0 }}>{col.name}</h3>
              <MdDelete
                style={{ color: "#3d3d3d" }}
                size={18}
                onClick={() => handleDeleteCollection(col.name)}
              />
            </div>

            <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
              {col.tests.length} карток
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
