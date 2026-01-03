// src/models/noteModel.ts
import pool from "../config/database";
import { WorkspaceNote } from "../types/notesTypes";

export const createNote = async (data: {
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  folder?: string;
}): Promise<WorkspaceNote> => {
  const query = `
    INSERT INTO workspace_notes (
      user_id, title, content, category, tags, folder
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    data.userId,
    data.title,
    data.content,
    data.category ?? "CONSUMER_LAW",
    data.tags ?? [],
    data.folder ?? "GENERAL",
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getNotesByUserId = async (
  userId: string
): Promise<WorkspaceNote[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM workspace_notes WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
};

export const getNoteById = async (
  noteId: string,
  userId: string
): Promise<WorkspaceNote | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM workspace_notes WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );
  return rows[0] || null;
};

export const updateNote = async (
  noteId: string,
  userId: string,
  data: Partial<WorkspaceNote>
): Promise<WorkspaceNote | null> => {
  const { rows } = await pool.query(
    `
    UPDATE workspace_notes
    SET
      title = COALESCE($3, title),
      content = COALESCE($4, content),
      category = COALESCE($5, category),
      tags = COALESCE($6, tags),
      folder = COALESCE($7, folder),
      is_archived = COALESCE($8, is_archived),
      updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING *;
    `,
    [
      noteId,
      userId,
      data.title,
      data.content,
      data.category,
      data.tags,
      data.folder,
      data.is_archived,
    ]
  );

  return rows[0] || null;
};

export const archiveNote = async (
  noteId: string,
  userId: string
): Promise<boolean> => {
  const res = await pool.query(
    `UPDATE workspace_notes SET is_archived = true WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );
  return res.rowCount === 1;
};

export const deleteNote = async (
  noteId: string,
  userId: string
): Promise<boolean> => {
  const res = await pool.query(
    `DELETE FROM workspace_notes WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );
  return res.rowCount === 1;
};
