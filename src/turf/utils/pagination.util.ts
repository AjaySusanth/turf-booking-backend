export interface CursorPayload {
    id: string,
    createdAt: string
}


export const encodeCursor = (payload: CursorPayload): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};


export const decodeCursor = (cursor: string): CursorPayload | null => {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};