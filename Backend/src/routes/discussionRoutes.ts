import { Router } from 'express';
import { DiscussionController } from '../controllers/discussionController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { validate } from '../utils/validation';

const router = Router();

// Validation schemas
const createDiscussionSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500
  },
  description: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000
  },
  discussionType: {
    type: 'string',
    required: true,
    enum: ['GENERAL', 'CASE_ANALYSIS', 'LEGAL_QUERY', 'OPINION_POLL']
  },
  category: {
    type: 'string',
    required: true
  },
  tags: {
    required: false,
    default: []
  },
  isPublic: {
    type: 'boolean',
    required: false,
    default: true
  }
};

const createReplySchema = {
  content: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000
  },
  parentReplyId: {
    type: 'string',
    required: false
  }
};

const markBestAnswerSchema = {
  replyId: {
    type: 'string',
    required: true
  }
};

// Public routes (now with optional authentication for personalization)
router.get('/', optionalAuthenticate, DiscussionController.getDiscussions);
router.get('/search', optionalAuthenticate, DiscussionController.searchDiscussions);
router.get('/:discussionId', optionalAuthenticate, DiscussionController.getDiscussionDetails);

// Protected routes (require authentication)
router.post('/', authenticate, validate(createDiscussionSchema), DiscussionController.createDiscussion);
router.post('/:discussionId/replies', authenticate, validate(createReplySchema), DiscussionController.addReply);
router.post('/replies/:replyId/upvote', authenticate, DiscussionController.toggleUpvote);
router.post('/:discussionId/follow', authenticate, DiscussionController.toggleFollow);
router.post('/:discussionId/upvote', authenticate, DiscussionController.toggleDiscussionUpvote);
router.post('/:discussionId/save', authenticate, DiscussionController.toggleSave);
router.post('/:discussionId/best-answer', authenticate, validate(markBestAnswerSchema), DiscussionController.markBestAnswer);
router.post('/:discussionId/resolve', authenticate, DiscussionController.markResolved);

export default router;
