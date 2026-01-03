/**
 * Core Note entity mapped directly to `workspace_notes` table
 */
export interface Note {
  id: string;
  user_id: string;

  title: string;
  content: string;

  category: string;
  tags: string[] | null;
  folder: string;

  is_archived: boolean;

  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
}

/**
 * Alias for clarity in services/controllers
 * (some devs prefer WorkspaceNote naming)
 */
export type WorkspaceNote = Note;

/**
 * Input when creating a note
 */
export interface CreateNoteInput {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  folder?: string;
}

/**
 * Input when updating a note
 */
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  folder?: string;
  is_archived?: boolean;
}

/**
 * Filters used when fetching notes
 */
export interface NotesFilterOptions {
  userId: string;

  category?: string;
  folder?: string;
  isArchived?: boolean;

  search?: string;

  page?: number;
  limit?: number;
}

/**
 * Standard paginated response for notes
 */
export interface NotesPaginatedResponse {
  data: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
