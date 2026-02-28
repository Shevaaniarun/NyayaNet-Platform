import express from 'express';
import { LawLibraryService } from '../services/lawLibraryService';
import { authenticate, AuthRequest } from '../middleware/auth'; 

const router = express.Router();

// Get all acts
router.get('/acts', async (req, res) => {
  try {
    const { category, page, limit } = req.query;
    const result = await LawLibraryService.getAllActs({
      category: category as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch acts' });
  }
});

// Get single act with sections
router.get('/acts/:actId', async (req, res) => {
  try {
    const act = await LawLibraryService.getActById(req.params.actId);
    if (!act) {
      return res.status(404).json({ error: 'Act not found' });
    }
    res.json(act);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch act' });
  }
});

// Get single section
router.get('/sections/:sectionId', async (req, res) => {
  try {
    const section = await LawLibraryService.getSectionById(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Search laws
router.get('/search', async (req, res) => {
  try {
    const { q, category, act_id, page, limit } = req.query;
    const result = await LawLibraryService.searchLaws({
      q: q as string,
      category: category as string,
      act_id: act_id as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search laws' });
  }
});

// Bookmark section (protected) - FIXED: Use userId from payload
router.post('/bookmarks/:sectionId', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Use userId from the auth payload (not the optional id field)
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid user data' });
    }
    
    const result = await LawLibraryService.toggleBookmark(userId, req.params.sectionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Get user bookmarks (protected) - FIXED: Use userId from payload
router.get('/bookmarks', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Use userId from the auth payload (not the optional id field)
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid user data' });
    }
    
    const bookmarks = await LawLibraryService.getUserBookmarks(userId);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

export default router;