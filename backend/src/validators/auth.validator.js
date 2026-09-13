import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  phone: z
    .string({ required_error: "Mobile number is required for courier delivery." })
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number (e.g. 9876543210)."),
  otp: z.string().trim().length(6, "Email OTP must be 6 digits.").optional(),
  phoneOtp: z.string().trim().length(6, "Mobile OTP must be 6 digits.").optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid admin email address."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Password reset token is required or expired."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});
