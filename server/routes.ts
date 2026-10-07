import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import {
  insertUserSchema,
  insertCheckinSchema,
  insertCommunityPostSchema,
  insertPostReplySchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── AUTH ROUTES (public) ────────────────────────────────────────────────

  /** POST /api/register — create a new account */
  app.post("/api/register", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid username or password." });
    }
    const { username, password } = result.data;

    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already taken. Choose another." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await storage.createUser({ username, password: passwordHash });

    req.session.userId = user.id;
    return res.status(201).json({ user: { id: user.id, username: user.username } });
  });

  /** POST /api/login — sign in with username + password */
  app.post("/api/login", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid username or password." });
    }
    const { username, password } = result.data;

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    req.session.userId = user.id;
    return res.json({ user: { id: user.id, username: user.username } });
  });

  /** POST /api/logout — destroy the session */
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  });

  /** GET /api/me — return the current logged-in user */
  app.get("/api/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ id: user.id, username: user.username });
  });

  // ── PROTECTED ROUTES ────────────────────────────────────────────────────
  // All routes below require a valid session (requireAuth middleware).

  app.get("/api/checkins", requireAuth, async (req, res) => {
    const checkins = await storage.getCheckins(req.session.userId!);
    res.json(checkins);
  });

  app.post("/api/checkins", requireAuth, async (req, res) => {
    const result = insertCheckinSchema.safeParse({ ...req.body, userId: req.session.userId });
    if (!result.success) return res.status(400).json(result.error);
    const checkin = await storage.createCheckin(result.data);

    const streak = await storage.getStreak(req.session.userId!);
    let { current, longest, orbs } = streak || { current: 0, longest: 0, orbs: 0 };

    if (checkin.relapseBool) {
      current = 0;
    } else {
      current++;
      if (current > longest) longest = current;
      orbs += 10;
    }

    await storage.updateStreak(req.session.userId!, { current, longest, orbs, lastCheckinDateISO: checkin.dateISO });
    res.json(checkin);
  });

  app.get("/api/streak", requireAuth, async (req, res) => {
    const streak = await storage.getStreak(req.session.userId!);
    res.json(streak || { current: 0, longest: 0, orbs: 0 });
  });

  app.get("/api/posts", requireAuth, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    const result = insertCommunityPostSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    const post = await storage.createPost(result.data);
    res.json(post);
  });

  app.post("/api/posts/:id/like", requireAuth, async (req, res) => {
    const post = await storage.likePost(parseInt(req.params.id as string));
    res.json(post);
  });

  app.post("/api/posts/:id/replies", requireAuth, async (req, res) => {
    const result = insertPostReplySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    const reply = await storage.addReply(parseInt(req.params.id as string), { ...result.data, postId: parseInt(req.params.id as string) });
    res.json(reply);
  });

  app.get("/api/lessons", requireAuth, async (req, res) => {
    const lessons = await storage.getLessons();
    const userLessons = await storage.getUserLessons(req.session.userId!);
    res.json(lessons.map(l => ({
      ...l,
      completed: !!userLessons.find(ul => ul.lessonId === l.id)
    })));
  });

  app.post("/api/lessons/:id/complete", requireAuth, async (req, res) => {
    await storage.completeLesson(req.session.userId!, parseInt(req.params.id as string));
    res.sendStatus(200);
  });

  app.get("/api/coach/messages", requireAuth, async (req, res) => {
    const messages = await storage.getCoachMessages(req.session.userId!);
    res.json(messages);
  });

  app.post("/api/coach/messages", requireAuth, async (req, res) => {
    const msg = await storage.addCoachMessage(req.session.userId!, req.body);
    res.json(msg);
  });

  return httpServer;
}
