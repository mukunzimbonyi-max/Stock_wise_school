import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";
import { pool } from "../db.js";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";
const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://stock-wise-school.vercel.app";

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/profile — update name & email for a user
authRouter.put("/profile", async (req, res) => {
  try {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).json({ error: "id, name and email are required" });
    }
    // Check email uniqueness (excluding current user)
    const conflict = await pool.query("SELECT id FROM users WHERE email=$1 AND id<>$2", [email, id]);
    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: "Email is already used by another account" });
    }
    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING id, name, email",
      [name, email, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("PUT /auth/profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/password — change password (requires current password)
authRouter.put("/password", async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "id, currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const userResult = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hash, id]);
    res.json({ success: true });
  } catch (error) {
    console.error("PUT /auth/password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/forgot-password — request a password reset email
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Always respond with success to avoid leaking which emails exist
    const userResult = await pool.query("SELECT id, name FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const user = userResult.rows[0];

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this user, then insert the new one
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id]);
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    );

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "GS NKUBI Stock System <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password — GS NKUBI Food Stock",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">GS NKUBI</h1>
                      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;">Food Stock Management</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-weight:700;">Password Reset Request</h2>
                      <p style="margin:0 0 8px;color:#475569;font-size:15px;">Hello ${user.name},</p>
                      <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;">
                        We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
                      </p>
                      <div style="text-align:center;margin-bottom:28px;">
                        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                          Reset My Password
                        </a>
                      </div>
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Or copy and paste this URL into your browser:</p>
                      <p style="margin:0 0 28px;word-break:break-all;color:#3b82f6;font-size:12px;">${resetLink}</p>
                      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;">Groupe Scolaire NKUBI · Huye District · Rwanda</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return res.status(500).json({ error: "Failed to send reset email. Please try again." });
    }

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("POST /auth/forgot-password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/reset-password — submit new password using reset token
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Look up the token
    const tokenResult = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
    }

    const { user_id } = tokenResult.rows[0];

    // Hash the new password and update
    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, user_id]);

    // Delete the used token
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user_id]);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("POST /auth/reset-password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
