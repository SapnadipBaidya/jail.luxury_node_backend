// Import dependencies
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const sequelize = require("./config/connection");
const routes = require("./routes");
const { AppError, globalErrorHandler } = require("./middlewares/errorHandler");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3001;

// ============================ Middleware ============================

// Rate limiter middleware
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.IPLIMIT || 10), // Default: 10 requests
  duration: parseInt(process.env.DURATION || 1), // Default: 1 second
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    console.error(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too Many Requests");
  }
});

// CORS middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ======================= Passport Configuration =======================

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile, "Refresh Token:", refreshToken);
      try {
        let user = await User.findOne({ where: { user_id: profile.id } });

        if (!user) {
          user = await User.create({
            user_id: profile.id,
            first_name: profile?.name?.givenName,
            last_name: profile?.name?.familyName,
            email: profile.emails[0]?.value,
            refreshToken,
          });
        } else {
          await user.update({ refreshToken });
        }

        done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        done(error, null);
      }
    }
  )
);

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
  (req, res) => {
    console.log("User authenticated, Access Token:", req.user.accessToken);
    res.redirect(`http://localhost:3000/?token=${req.user.accessToken}`);
  }
);

// User success route
app.get("/success", (req, res) => {
  if (!req.user) return res.status(401).send("Not authenticated");

  res.json({
    user: {
      id: req.user.user_id,
      name: req.user.first_name,
      email: req.user.email,
    },
    accessToken: req.user.accessToken,
  });
});

// Refresh token route
app.get("/auth/refresh", async (req, res) => {
  if (!req.user) return res.status(401).send("Not authenticated");

  try {
    const user = await User.findOne({ where: { user_id: req.user.user_id } });
    if (!user || !user.refreshToken) return res.status(401).send("No refresh token available");

    const { data } = await axios.post("https://oauth2.googleapis.com/token", null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: user.refreshToken,
        grant_type: "refresh_token",
      },
    });

    req.user.accessToken = data.access_token;
    res.json({ accessToken: data.access_token });
  } catch (error) {
    console.error("Refresh Token Error:", error.response?.data || error.message);
    res.status(500).send("Failed to refresh token");
  }
});

// Logout route
app.get("/logout", async (req, res) => {
  if (req.user) {
    try {
      const user = await User.findOne({ where: { user_id: req.user.user_id } });
      if (user) await user.update({ refreshToken: null });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

  req.logout(() => res.redirect("http://localhost:3000"));
});

// Import additional routes
app.use(routes);

// ========================== Error Handling ==========================

// Global error handler
app.use(globalErrorHandler);

// ======================= Server Initialization =======================

// Sync Sequelize and start server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
