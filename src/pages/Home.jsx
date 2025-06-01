import { useNavigate } from "react-router-dom";
import { useTestContext } from "../context/TestContext";
import { MdDelete } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { RiExportFill, RiImportFill } from "react-icons/ri";
import { exportCollections } from "../utils/exportCollection";
import { FaEye, FaEyeSlash, FaFileExport, FaFileImport } from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";
import { useRef } from "react";

export default function Home() {
  const { collections, getSession } = useTestContext();
  const { deleteCollection } = useTestContext();
  const navigate = useNavigate();

  const editBtn = {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "0.7rem 1rem",
    marginBottom: "0.5rem",
    marginTop: "0.7rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #E7E7E8",
    cursor: "pointer",
    backgroundColor: "#E7E7E8",
    transition: "background-color 0.3s, border-color 0.3s",
  };

  const ImportButton = ({ style: editBtn }) => {
    const { setCollections } = useTestContext();
    const fileInputRef = useRef();

    const handleImport = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) {
            imported = [imported];
          }

          setCollections((prev) => [...prev, ...imported]);
          console.log("✅ Імпортовано колекції:", imported);
        } catch (error) {
          alert("❌ Помилка імпорту: невірний формат JSON");
        }
      };
      reader.readAsText(file);
    };

    return (
      <>
        <label style={{ display: "inline-block" }}>
          <button
            style={editBtn}
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current.click();
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RiImportFill style={{ marginRight: "0.5rem" }} size={18} />
              <span>Імпортувати</span>
            </div>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>
      </>
    );
  };

  const handleDeleteCollection = (name) => {
    if (window.confirm(`Видалити колекцію "${name}"? Це не можна скасувати.`)) {
      deleteCollection(name);
    }
  };

  const jumpToLearn = (name) => {
    navigate("/learn", { state: { selectedCategory: name } });
  };

  const jumpToTesting = (name) => {
    navigate("/test", { state: { selectedCategory: name } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Категорії</h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          marginLeft: "0.2rem",
          marginRight: "0.2rem",
        }}
      >
        <ImportButton
          // onClick={() => )}
          style={editBtn}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiImportFill style={{ marginRight: "0.5rem" }} size={18} />
            <span>Імпортувати</span>
          </div>
        </ImportButton>

      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          width: "100%",
          animation: "fadeIn 0.4s ease-in-out forwards",
        }}
      >
        {collections.map((col, i) => {
          const session = getSession(col.name);

          const progress = session
            ? Math.floor(
                (session.currentIndex / session.shuffledTests.length) * 100
              )
            : null;

          return (
            <div
              key={i}
              style={{
                flex: "1 1 calc(33.333% - 1rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
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
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{col.name}</h3>
                <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                  {col.tests.length} карток
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "revert",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <FaInfoCircle
                    style={{ color: "#3d3d3d", cursor: "pointer" }}
                    size={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToLearn(col.name);
                    }}
                  />
                  <BiSolidMessageSquareEdit
                    style={{ color: "#3d3d3d", cursor: "pointer" }}
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <FaNoteSticky
                    style={{ color: "#3d3d3d", cursor: "pointer" }}
                    size={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToTesting(col.name);
                    }}
                  />
                  <MdDelete
                    style={{ color: "#3d3d3d", cursor: "pointer" }}
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(col.name);
                    }}
                  />
                </div>
              </div>

              <div style={{ width: 50, height: 50, marginLeft: "1rem" }}>
                <CircularProgressbar
                  value={progress ?? 0}
                  text={progress != null ? `${progress}%` : "-"}
                  styles={buildStyles({
                    textSize: "24px",
                    pathColor: "#3498db",
                    textColor: "#333",
                    trailColor: "#eee",
                  })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
