// src/services/notesServices.ts

import * as notesModel from "../models/Note"; // CORRECTED PATH
import {
  CreateNoteInput,
  UpdateNoteInput,
  WorkspaceNote,
} from "../types/notesTypes";

/**
 * Create a new workspace note
 */
export async function createNote(
  userId: string,
  data: CreateNoteInput
): Promise<WorkspaceNote> {
  if (!data.title || !data.content) {
    throw new Error("Title and content are required");
  }

  // FIX: Pass a single object, not two parameters
  return await notesModel.createNote({
    userId,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
    folder: data.folder
  });
}

/**
 * Get all notes for a user with optional filtering
 */
export async function getUserNotes(
  userId: string,
  query?: any // Add query parameter
): Promise<WorkspaceNote[]> {
  // FIX: Remove the second parameter (query) as model doesn't support it yet
  // Or add query support to the model
  return await notesModel.getNotesByUserId(userId);
}

/**
 * Get a single note by ID (ownership enforced)
 */
export async function getNoteById(
  noteId: string,
  userId: string
): Promise<WorkspaceNote | null> {
  return await notesModel.getNoteById(noteId, userId);
}

/**
 * Update a note (only owner allowed)
 */
export async function updateNote(
  noteId: string,
  userId: string,
  data: UpdateNoteInput
): Promise<WorkspaceNote | null> {
  return await notesModel.updateNote(noteId, userId, data);
}

/**
 * Archive (soft delete) a note
 */
export async function archiveNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  return await notesModel.archiveNote(noteId, userId);
}

/**
 * Permanently delete a note (only owner allowed)
 */
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  return await notesModel.deleteNote(noteId, userId);
}