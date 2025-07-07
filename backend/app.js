require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

const app = express();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10kb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
      sameSite: 'lax' 
    }, 
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/login", limiter);
app.use("/api/register", limiter);
app.use("/api/user", limiter); 


const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized. Please log in." });
    }
};


const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").trim().notEmpty().isLength({ min: 8 }),
];

const validateRegistration = [
  body("name").trim().notEmpty().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
  body("level").trim().notEmpty().isInt({ min: 1, max: 3 }),
];

const validateProfileUpdate = [
    body("name").trim().notEmpty().escape(),
];

const validatePasswordUpdate = [
    body("currentPassword").trim().notEmpty(),
    body("newPassword")
        .trim()
        .isLength({ min: 8 })
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
        .withMessage('Password must be at least 8 characters long and include a number and a special character.'),
];

const validateLevelUpdate = [
    body("level").isInt({ min: 1, max: 2 }).withMessage("Invalid level selected."),
];



app.post("/api/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.level = user.level;
      res.json({
        message: "Login successful",
        level: parseInt(user.level),
        name: user.name,
        email: user.email 
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/register", validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, level } = req.body;
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.query(
            "INSERT INTO users (name, email, password, level) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, level]
        );
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/content", isAuthenticated, async (req, res) => {
    try {
        const userLevel = req.session.level;
        const [content] = await pool.query(
            `SELECT id, title, level,description, content FROM educational_content WHERE level <= ? ORDER BY id`,
            [userLevel]
        );
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/quiz", isAuthenticated, async (req, res) => {
    try {
        const userLevel = req.session.level;
        const [questions] = await pool.query(
            "SELECT id, question_text, option1, option2, option3, option4, correct_answer FROM quizzes WHERE level = ? ORDER BY RAND() LIMIT 10",
            [userLevel]
        );
        req.session.quizQuestions = questions;
        const clientQuestions = questions.map(
            ({ id, question_text, option1, option2, option3, option4 }) => ({
                id,
                question_text,
                options: [option1, option2, option3, option4],
            })
        );
        res.json(clientQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/quiz", isAuthenticated, async (req, res) => {
    try {
        const { answers } = req.body;
        const storedQuestions = req.session.quizQuestions;
        if (!storedQuestions) {
            return res.status(400).json({ message: "No active quiz found. Please start a new quiz." });
        }
        const correctAnswersMap = new Map(
            storedQuestions.map((q) => [q.id, q.correct_answer])
        );
        let correctCount = 0;
        for (const answer of answers) {
            const correctAnswer = correctAnswersMap.get(answer.id);
            if (correctAnswer === answer.selectedAnswerIndex) {
                correctCount++;
            }
        }
        req.session.quizQuestions = null;
        res.json({
            score: correctCount,
            total: storedQuestions.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.put('/api/user/profile', isAuthenticated, validateProfileUpdate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { name } = req.body;
        const userId = req.session.userId;

        await pool.query("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
        
        res.json({ message: "Profile updated successfully." });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put('/api/user/password', isAuthenticated, validatePasswordUpdate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = rows[0];
        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect current password." });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.put('/api/user/level', isAuthenticated, validateLevelUpdate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { level } = req.body;
        const userId = req.session.userId;

        await pool.query("UPDATE users SET level = ? WHERE id = ?", [level, userId]);
        
        req.session.level = level;

        res.json({ message: "Account level updated successfully." });

    } catch (error) {
        console.error("Level update error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/api/analyze', isAuthenticated, async (req, res) => {
  if (req.session.level !== 2) {
      return res.status(403).json({ error: "Access denied. This feature is for authorized users only."})
  }
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }
    console.log("Received code for analysis. Contacting Gemini...");
    const prompt = `
      You are an expert security code reviewer. Your task is to analyze the following code snippet for security vulnerabilities.
      Please provide a detailed report. Format your entire response using Markdown for readability.

      First, for each vulnerability you find, describe:
      1. **Vulnerability**: What is the vulnerability and where is its location (line number)?
      2. **Risk**: What is the potential risk or impact of this vulnerability?
      3. **Recommendation**: What is the clear recommendation on how to fix it?

      After detailing all the vulnerabilities, provide a final section titled "### Corrected Code".
      In this section, present the full, corrected version of the original code snippet with all the recommended fixes applied.

      If you find no vulnerabilities, state that clearly and present the original code under the "### Corrected Code" heading.

      Here is the code to analyze:
      \`\`\`javascript
      ${code}
      \`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reportText = response.text();
    console.log("Successfully received report from Gemini.");
    res.json({ report: reportText });
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    res.status(500).json({ error: 'Failed to get a report from the AI.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Unified server running on port ${PORT}`);
});