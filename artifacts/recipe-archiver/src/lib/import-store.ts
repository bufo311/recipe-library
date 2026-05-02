export interface PendingImport {
  title: string;
  sourceUrl: string;
  ingredients: string[];
  instructions: string[];
  imagePath: string | null;
  yields: string | null;
  totalTime: string | null;
  prepTime: string | null;
  cookTime: string | null;
  course: string | null;
  cuisine: string | null;
  attribute: string[];
}

let pending: PendingImport | null = null;

export function setPendingImport(data: PendingImport): void {
  pending = data;
}

export function consumePendingImport(): PendingImport | null {
  const data = pending;
  pending = null;
  return data;
}
