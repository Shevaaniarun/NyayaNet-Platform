// src/models/noteModel.ts

import pool from "../config/database";
import { WorkspaceNote } from "../types/notesTypes";

/**
 * Create a new workspace note
 */
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
      user_id,
      title,
      content,
      category,
      tags,
      folder
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      user_id        AS "userId",
      title,
      content,
      category,
      tags,
      folder,
      is_archived    AS "isArchived",
      created_at     AS "createdAt",
      updated_at     AS "updatedAt",
      last_accessed_at AS "lastAccessedAt";
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

/**
 * Get all notes for a user
 */
export const getNotesByUserId = async (
  userId: string
): Promise<WorkspaceNote[]> => {
  const query = `
    SELECT
      id,
      user_id        AS "userId",
      title,
      content,
      category,
      tags,
      folder,
      is_archived    AS "isArchived",
      created_at     AS "createdAt",
      updated_at     AS "updatedAt",
      last_accessed_at AS "lastAccessedAt"
    FROM workspace_notes
    WHERE user_id = $1
    ORDER BY updated_at DESC;
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * Get single note (user scoped)
 */
export const getNoteById = async (
  noteId: string,
  userId: string
): Promise<WorkspaceNote | null> => {
  const query = `
    SELECT
      id,
      user_id        AS "userId",
      title,
      content,
      category,
      tags,
      folder,
      is_archived    AS "isArchived",
      created_at     AS "createdAt",
      updated_at     AS "updatedAt",
      last_accessed_at AS "lastAccessedAt"
    FROM workspace_notes
    WHERE id = $1 AND user_id = $2;
  `;

  const { rows } = await pool.query(query, [noteId, userId]);
  return rows[0] || null;
};

/**
 * Update a note
 */
export const updateNote = async (
  noteId: string,
  userId: string,
  data: Partial<WorkspaceNote>
): Promise<WorkspaceNote | null> => {
  const query = `
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
    RETURNING
      id,
      user_id        AS "userId",
      title,
      content,
      category,
      tags,
      folder,
      is_archived    AS "isArchived",
      created_at     AS "createdAt",
      updated_at     AS "updatedAt",
      last_accessed_at AS "lastAccessedAt";
  `;

  const values = [
    noteId,
    userId,
    data.title,
    data.content,
    data.category,
    data.tags,
    data.folder,
    data.is_archived
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

/**
 * Archive (soft delete)
 */
export const archiveNote = async (
  noteId: string,
  userId: string
): Promise<boolean> => {
  const res = await pool.query(
    `UPDATE workspace_notes
     SET is_archived = true
     WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );

  return res.rowCount === 1;
};

/**
 * Permanently delete
 */
export const deleteNote = async (
  noteId: string,
  userId: string
): Promise<boolean> => {
  const res = await pool.query(
    `DELETE FROM workspace_notes
     WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );

  return res.rowCount === 1;
};
