export const createId = () =>
  (Date.now().toString(36) + Math.random().toString(36).substring(2, 10)).toUpperCase();

