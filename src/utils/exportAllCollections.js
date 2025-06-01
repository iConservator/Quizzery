import { exportCollections } from "./exportCollection";
import { useTestContext } from "../context/TestContext";

export const ExportAllButton = ({ style: editBtn }) => {
  const { collections } = useTestContext();

  return (
    <>
      <label style={{ display: "inline-block" }}>
        <button
          style={editBtn}
          onClick={(e) => {
            exportCollections(collections);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>Експортувати</span>
          </div>
        </button>
      </label>
    </>
  );
};
