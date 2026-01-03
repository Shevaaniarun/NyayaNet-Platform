// src/controllers/notesController.ts

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import * as notesService from "../services/notesServices";

/**
 * Create a new workspace note
 * POST /api/notes
 */
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const note = await notesService.createNote(userId, req.body);

    return res.status(201).json({
      message: "Note created successfully",
      data: note,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to create note",
    });
  }
};

/**
 * Get all notes for logged-in user
 * GET /api/notes
 */
export const getUserNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // FIX: Remove the query parameter
    const notes = await notesService.getUserNotes(userId);

    return res.status(200).json({ data: notes });
  } catch {
    return res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

/**
 * Get a single note by ID
 * GET /api/notes/:id
 */
export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const note = await notesService.getNoteById(noteId, userId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json({ data: note });
  } catch {
    return res.status(500).json({
      message: "Failed to fetch note",
    });
  }
};

/**
 * Update a note
 * PUT /api/notes/:id
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedNote = await notesService.updateNote(
      noteId,
      userId,
      req.body
    );

    if (!updatedNote) {
      return res.status(404).json({
        message: "Note not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch {
    return res.status(400).json({
      message: "Failed to update note",
    });
  }
};

/**
 * Archive (soft delete) a note
 * PATCH /api/notes/:id/archive
 */
export const archiveNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const success = await notesService.archiveNote(noteId, userId);

    if (!success) {
      return res.status(404).json({
        message: "Note not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Note archived successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Failed to archive note",
    });
  }
};

/**
 * Permanently delete a note
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the function exists, if not use an alternative
    let success: boolean;
    
    if (notesService.deleteNote) {
      success = await notesService.deleteNote(noteId, userId);
    } else {
      // Alternative: Use a different function or implement directly
      // For now, we'll throw an error to be caught below
      throw new Error("deleteNote service function not implemented");
    }

    if (!success) {
      return res.status(404).json({
        message: "Note not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Note deleted permanently",
    });
  } catch (error: any) {
    console.error("Delete note error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete note",
    });
  }
};