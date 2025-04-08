// lib/sanitize.ts
export const sanitizeMongoDoc = <T extends Record<string, any>>(doc: T): T => {
    const sanitized = JSON.parse(JSON.stringify(doc));
    
    // Convert Date objects to ISO strings
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] instanceof Date) {
        sanitized[key] = sanitized[key].toISOString();
      }
    });
  
    return sanitized;
  };