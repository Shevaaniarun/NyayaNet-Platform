import { Router } from 'express';
import { DiscussionController } from '../controllers/discussionController';
import { authenticate } from '../middleware/auth';
import { validate } from '../utils/validation';

const router = Router();

// Validation schemas
const createDiscussionSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 500
  },
  description: {
    type: 'string',
    required: true,
    minLength: 20,
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
    type: 'array',
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
    minLength: 5,
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

// Public routes
router.get('/', DiscussionController.getDiscussions);
router.get('/search', DiscussionController.searchDiscussions);
router.get('/:discussionId', DiscussionController.getDiscussionDetails);

// Protected routes (require authentication)
router.post('/', authenticate, validate(createDiscussionSchema), DiscussionController.createDiscussion);
router.post('/:discussionId/replies', authenticate, validate(createReplySchema), DiscussionController.addReply);
router.post('/replies/:replyId/upvote', authenticate, DiscussionController.toggleUpvote);
router.post('/:discussionId/follow', authenticate, DiscussionController.toggleFollow);
router.post('/:discussionId/best-answer', authenticate, validate(markBestAnswerSchema), DiscussionController.markBestAnswer);
router.post('/:discussionId/resolve', authenticate, DiscussionController.markResolved);

export default router;