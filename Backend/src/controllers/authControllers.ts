import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authServices";

/* -------------------- REGISTER -------------------- */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = await registerUser({
      email,
      password,
      fullName,
      role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};

/* -------------------- LOGIN -------------------- */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Login failed",
    });
  }
};
