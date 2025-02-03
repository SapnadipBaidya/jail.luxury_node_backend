import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { RateLimiterMemory } from "rate-limiter-flexible";
import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import routes from "./routes/index.js";
import { AppError, globalErrorHandler } from "./middlewares/errorHandler.js";
import User from "./models/User.js";
import connection from "./config/connection.js";
import dotenv from "dotenv";


dotenv.config();

const sequelize = connection;
const app = express();
const PORT = process.env.PORT || 3001;





const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ============================ Middleware ============================

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).send("Too Many Requests");
  }
});

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"] // Production origin
    : ["http://localhost:3000"]; // Development origin

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ======================= Passport Configuration =======================

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { user_id: profile.id } });

        if (!user) {
          const newRefreshToken = crypto.randomBytes(64).toString("hex"); // Generate secure refresh token
          user = await User.create({
            user_id: profile.id,
            first_name: profile?.name?.givenName,
            last_name: profile?.name?.familyName,
            email: profile.emails[0]?.value,
            refreshToken: newRefreshToken,
          });
        }

        done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        done(error, null);
      }
    }
  )
);

// ========================== Utility Functions ==========================

const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = async (user) => {
  const now = new Date();
  const rotationThreshold = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds
  // Check if the refresh token was rotated within the last 10 days and iff user is logged in
  if (user.is_logged_in && user.updated_at && now - user.updated_at < rotationThreshold) {
    return user.refreshToken; // Return the existing refresh token
  }
  // Rotate refresh token
  const newRefreshToken = crypto.randomBytes(64).toString("hex");
  await user.update({
    refreshToken: newRefreshToken,
    updated_at: now, // Update rotation timestamp
    is_logged_in:1
  });
  return newRefreshToken;
};

// ========================== Routes ==========================

// Google OAuth login
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

// Google OAuth callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = await generateRefreshToken(req.user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge:  15 * 60 * 60 * 1000,
      });
  

    res.redirect(`http://localhost:3000/profile`);
  }
);

// User success route
app.get("/success", async (req, res) => {
  if (!req.user) return res.status(401).send("Not authenticated");

  const user = await User.findOne({ where: { user_id: req.user.user_id } });
  if (!user) return res.status(404).send("User not found");

  res.json({
    user: {
      id: user.user_id,
      name: user.first_name,
      email: user.email,
    },
  });
});

// Refresh token route
app.get("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).send("No refresh token provided");

  try {
    const user = await User.findOne({ where: { refreshToken ,is_logged_in:1} });
    if (!user) return res.status(401).send("Invalid refresh token");

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 15 * 60 * 60 * 1000,
      });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).send("Failed to refresh token");
  }
});

// Logout route
app.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const user = await User.findOne({ where: { refreshToken } });
      if (user) await user.update({ refreshToken: null ,is_logged_in:0});

      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "Strict", // Prevent CSRF attacks
      });
    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({ message: "Failed to log out" });
    }
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }
    console.log("Session destroyed");

    // Send a success response to the frontend
    res.status(200).json({ message: "Logged out successfully", redirectUrl: "http://localhost:3000" });
  });
});


// ==========================secured route testing ==========================
app.get("/secure-data", verifyToken, async (req, res) => {
  try {
    // Example secured data response
    const user = await User.findOne({ where: { user_id: req.user.user_id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Access granted to secured data",
      data: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching secure data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Import additional routes
app.use(routes);

// ========================== Error Handling ==========================

app.use(globalErrorHandler);

// ======================= Server Initialization =======================

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
})