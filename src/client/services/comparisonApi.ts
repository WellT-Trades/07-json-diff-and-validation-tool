const API_BASE_URL = "http://127.0.0.1:5000";

export interface SaveComparisonInput {
  title: string;
  original_json: unknown;
  updated_json: unknown;
  changes: unknown[];
}

export interface SavedComparison {
  id: number;
  title: string;
  created_at: string;
}

export async function saveComparison(
  comparison: SaveComparisonInput,
): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/comparisons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comparison),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Failed to save comparison.");
  }

  return result.id;
}

export async function getComparisons(): Promise<SavedComparison[]> {
  const response = await fetch(`${API_BASE_URL}/comparisons`);

  if (!response.ok) {
    throw new Error("Failed to retrieve saved comparisons.");
  }

  return response.json();
}
