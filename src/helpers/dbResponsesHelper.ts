export interface InsertResponse {
  affectedRows?: number;
  insertId?: number | string;
  warningStatus?: number;
}

export interface DeleteResponse {
  affectedRows?: number;
  insertId?: number;
  warningStatus?: number;
}