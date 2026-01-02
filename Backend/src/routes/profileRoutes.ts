import { Router } from "express";
import { ProfileController } from "../controllers/profileController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public Routes (if any needed, e.g. viewing public profiles without login)
// Currently all profile routes seem to benefit from auth or context

// Protected Routes
// Note: Some might be accessible publicly if we check req.user optionally, 
// but existing controller methods largely expect auth for write/updates.
// For reading, we'll assume auth is preferred or required for now.

router.get("/:userId", authenticate, ProfileController.getProfile);
router.put("/", authenticate, ProfileController.updateProfile);

router.get("/:userId/followers", authenticate, (req, res) => {
    // Placeholder - Controller doesn't have getFollowers yet
    res.json({ success: true, data: { followers: [] } });
});

router.get("/:userId/following", authenticate, (req, res) => {
    // Placeholder - Controller doesn't have getFollowing yet
    res.json({ success: true, data: { following: [] } });
});

// Certifications
router.get("/:userId/certifications", ProfileController.getCertifications);
router.post("/certifications", authenticate, ProfileController.addCertification);
router.delete("/certifications/:certificationId", authenticate, ProfileController.deleteCertification);

// Bookmarks
router.get("/bookmarks", authenticate, ProfileController.getBookmarks);

// Certifications
router.get("/:userId/certifications", ProfileController.getCertifications);
router.post("/certifications", authenticate, ProfileController.addCertification);
router.delete("/certifications/:certificationId", authenticate, ProfileController.deleteCertification);

// Bookmarks
router.get("/bookmarks", authenticate, ProfileController.getBookmarks);

// Content
router.get("/:userId/posts", authenticate, ProfileController.getUserPosts);
router.get("/:userId/discussions", authenticate, ProfileController.getUserDiscussions);

// Search
router.get("/search", authenticate, ProfileController.searchUserContent);

export default router;
