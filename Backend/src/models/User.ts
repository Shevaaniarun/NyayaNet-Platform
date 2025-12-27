import pool from "../config/database";

/**
 * Shape of user data needed to CREATE a user
 * (used during registration)
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

/**
 * Shape of user returned from DB
 * (password hash is included because service layer needs it)
 */
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

/**
 * Find user by email
 */
export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const query = `
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
  `;

  const result = await pool.query(query, [email]);

  return result.rows.length ? result.rows[0] : null;
};

/**
 * Find user by ID
 */
export const findUserById = async (
  id: string
): Promise<User | null> => {
  const query = `
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
  `;

  const result = await pool.query(query, [id]);

  return result.rows.length ? result.rows[0] : null;
};

/**
 * Create a new user
 */
export const createUser = async (
  data: CreateUserInput
): Promise<User> => {
  const query = `
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
  `;

  const values = [
    data.email,
    data.passwordHash,
    data.fullName,
    data.role
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  const query = `
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await pool.query(query, [userId]);
};
