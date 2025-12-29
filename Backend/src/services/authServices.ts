import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  updateLastLogin,
} from "../models/User";

const SALT_ROUNDS = 10;

/* -------------------- TYPES -------------------- */

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/* -------------------- JWT HELPERS -------------------- */

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

const getJwtOptions = (): SignOptions => ({
  expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] ?? "1d",
});

/* -------------------- REGISTER -------------------- */

export const registerUser = async ({
  email,
  password,
  fullName,
  role,
}: RegisterInput) => {
  // 1. Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create user
  const user = await createUser({
    email,
    passwordHash,
    fullName,
    role,
  });

  // 4. Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    getJwtSecret(),
    getJwtOptions()
  );

  // 5. Return safe response
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  };
};

/* -------------------- LOGIN -------------------- */

export const loginUser = async ({ email, password }: LoginInput) => {
  // 1. Find user
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 2. Check if account is active
  if (!user.is_active) {
    throw new Error("Account is deactivated");
  }

  // 3. Compare password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // 4. Update last login
  await updateLastLogin(user.id);

  // 5. Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    getJwtSecret(),
    getJwtOptions()
  );

  // 6. Return safe response
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  };
};
