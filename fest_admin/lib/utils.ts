// Helper to serialize BigInt values to standard Numbers/JSON types
export function serializeData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

// Helper to format Date strings to local Spanish formatting
export function formatLocalDate(dateString: string | Date | null): string {
  if (!dateString) return "Fecha no programada";
  
  return new Date(dateString).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
