export type Document = Readonly<{
  id: string;
  text: string;
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type RetrieveOptions = Readonly<{
  limit?: number;
}>;

export interface Retriever {
  retrieve(query: string, options?: RetrieveOptions): Promise<Document[]>;
}

export function createInMemoryRetriever(
  documents: readonly Document[],
): Retriever {
  return {
    async retrieve(query, options = {}) {
      const limit = options.limit ?? 5;
      const needles = query.toLowerCase().split(/\s+/).filter(Boolean);

      const ranked = documents
        .map((document) => {
          const haystack = document.text.toLowerCase();
          const score = needles.reduce(
            (total, needle) => total + (haystack.includes(needle) ? 1 : 0),
            0,
          );
          return { document, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.document);

      return ranked;
    },
  };
}

export function formatRetrievedContext(documents: readonly Document[]): string {
  if (documents.length === 0) {
    return "No documents found.";
  }

  return documents
    .map((document, index) => `[${index + 1}] (${document.id}) ${document.text}`)
    .join("\n");
}
