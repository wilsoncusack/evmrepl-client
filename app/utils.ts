export function extractFileName(filePath: string): string {
  // This regex matches everything after the last '/' or '\' in the path
  const match = filePath.match(/[/\\]([^/\\]+)$/);
  return match ? match[1] : filePath;
}

export const replacer = (key: any, value: any) =>
  typeof value === "bigint" ? value.toString() : value;
