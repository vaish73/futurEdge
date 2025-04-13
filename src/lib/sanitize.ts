// lib/sanitize.ts

export const sanitizeMongoDoc = <T extends Record<string, any>>(doc: T): T => {
  const sanitized = JSON.parse(JSON.stringify(doc));

  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] instanceof Date) {
      sanitized[key] = sanitized[key].toISOString();
    }
  });

  return sanitized;
};

// 🚀 New helper for arrays
export const sanitizeMongoDocs = <T extends Record<string, any>>(docs: T[]): T[] => {
  return docs.map(sanitizeMongoDoc);
};
