// Helper to serialize BigInt values to standard Numbers/JSON types
export function serializeData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}
