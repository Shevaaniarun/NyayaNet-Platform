import { PostModel } from '../models/Post';
import { PostLikeModel } from '../models/PostLike';
import { CreatePostInput, PostFilters } from '../types/postTypes';

export class PostService {
  static async createPost(data: CreatePostInput, userId: string) {
    return PostModel.create(data, userId);
  }

  static async getFeed(filters: PostFilters, userId?: string) {
    return PostModel.getFeed(filters, userId);
  }

  static async toggleLike(postId: string, userId: string) {
    return PostLikeModel.toggleLike(postId, userId);
  }
}
