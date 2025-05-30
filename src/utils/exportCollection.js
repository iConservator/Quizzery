export function exportCollections(collections) {
  const dataStr = JSON.stringify(collections, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "collections.json";
  a.click();

  URL.revokeObjectURL(url);
}