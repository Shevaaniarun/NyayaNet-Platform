import pool from "../config/database";
import { UpdateProfileInput, ProfileResponse } from "../types/profileTypes";

/* ======================================================
   AUTH / CORE USER TYPES (used for login & registration)
====================================================== */

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  last_login_at: Date | null;
}

/* ======================================================
   AUTH-RELATED QUERIES
====================================================== */

export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (
  id: string
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const createUser = async (
  data: CreateUserInput
): Promise<User> => {
  const result = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      role
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    `,
    [data.email, data.passwordHash, data.fullName, data.role]
  );

  return result.rows[0];
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId]
  );
};

/* ======================================================
   PROFILE / SOCIAL FEATURES MODEL
====================================================== */

export class UserModel {
  static async findById(
    id: string,
    requesterId?: string
  ): Promise<ProfileResponse | null> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.role, u.designation, u.organization,
        u.area_of_interest, u.experience_years, u.bio, u.location,
        u.website_url, u.linkedin_url, u.profile_photo_url, u.cover_photo_url,
        u.follower_count, u.following_count, u.post_count, u.discussion_count,
        u.created_at,
        ${
          requesterId
            ? `EXISTS(
                SELECT 1 FROM user_follows uf
                WHERE uf.follower_id = $2
                AND uf.following_id = u.id
                AND uf.status = 'ACCEPTED'
              ) AS is_following`
            : "false AS is_following"
        }
      FROM users u
      WHERE u.id = $1 AND u.is_active = true
    `;

    const params = requesterId ? [id, requesterId] : [id];
    const result = await pool.query(query, params);

    if (!result.rows[0]) return null;
    const row = result.rows[0];

    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      designation: row.designation,
      organization: row.organization,
      areaOfInterest: row.area_of_interest || [],
      experienceYears: row.experience_years,
      bio: row.bio,
      location: row.location,
      websiteUrl: row.website_url,
      linkedinUrl: row.linkedin_url,
      profilePhotoUrl: row.profile_photo_url,
      coverPhotoUrl: row.cover_photo_url,
      followerCount: row.follower_count,
      followingCount: row.following_count,
      postCount: row.post_count,
      discussionCount: row.discussion_count,
      isFollowing: row.is_following,
      createdAt: row.created_at.toISOString()
    };
  }

  static async update(
    userId: string,
    updates: UpdateProfileInput
  ): Promise<ProfileResponse | null> {
    const fieldMap: Record<string, string> = {
      fullName: "full_name",
      designation: "designation",
      organization: "organization",
      areaOfInterest: "area_of_interest",
      bio: "bio",
      location: "location",
      websiteUrl: "website_url",
      linkedinUrl: "linkedin_url"
    };

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (!fields.length) return this.findById(userId);

    values.push(userId);
    await pool.query(
      `
      UPDATE users
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx} AND is_active = true
      `,
      values
    );

    return this.findById(userId);
  }
}
