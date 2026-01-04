import { Router } from "express";
import { ProfileController } from "../controllers/profileController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Static routes MUST come before /:userId param routes
// Authenticated user's own data
router.get("/bookmarks", authenticate, ProfileController.getBookmarks);
router.get("/search", authenticate, ProfileController.searchUserContent);
router.get("/liked-posts", authenticate, ProfileController.getLikedPosts);
router.get("/liked-discussions", authenticate, ProfileController.getLikedDiscussions);
router.get("/following-discussions", authenticate, ProfileController.getFollowingDiscussions);

// Update own profile
router.put("/", authenticate, ProfileController.updateProfile);

// Certifications - own profile actions
router.post("/certifications", authenticate, ProfileController.addCertification);
router.delete("/certifications/:certificationId", authenticate, ProfileController.deleteCertification);

// Parameterized routes - any user's public data
router.get("/:userId", authenticate, ProfileController.getProfile);
router.get("/:userId/posts", authenticate, ProfileController.getUserPosts);
router.get("/:userId/discussions", authenticate, ProfileController.getUserDiscussions);
router.get("/:userId/certifications", ProfileController.getCertifications);

router.get("/:userId/followers", authenticate, (req, res) => {
    // Placeholder - implement when needed
    res.json({ success: true, data: { followers: [] } });
});

router.get("/:userId/following", authenticate, (req, res) => {
    // Placeholder - implement when needed
    res.json({ success: true, data: { following: [] } });
});

export default router;
