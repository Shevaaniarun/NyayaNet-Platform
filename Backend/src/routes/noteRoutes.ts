// src/routes/noteRoutes.ts

import { Router } from "express";
import {
  createNote,
  getUserNotes,
  getNoteById,
  updateNote,
  archiveNote,
  deleteNote,
} from "../controllers/notesController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * All routes here are USER-SCOPED
 * JWT authentication is mandatory
 */

/**
 * Create a new note
 * POST /api/notes
 */
router.post("/", authenticate, createNote);

/**
 * Get all notes of logged-in user
 * GET /api/notes
 */
router.get("/", authenticate, getUserNotes);

/**
 * Get a single note by ID
 * GET /api/notes/:id
 */
router.get("/:id", authenticate, getNoteById);

/**
 * Update a note
 * PUT /api/notes/:id
 */
router.put("/:id", authenticate, updateNote);

/**
 * Archive (soft delete) a note
 * PATCH /api/notes/:id/archive
 */
router.patch("/:id/archive", authenticate, archiveNote);

/**
 * Permanently delete a note
 * DELETE /api/notes/:id
 */
router.delete("/:id", authenticate, deleteNote);

export default router;
