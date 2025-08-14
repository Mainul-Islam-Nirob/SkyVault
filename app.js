require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('@prisma/client');
const PrismaStore = require('@quixo3/prisma-session-store').PrismaSessionStore;
const bcrypt = require('bcrypt');
const path = require('path');
const engine = require('ejs-mate');
const setLocals = require('./middleware/setLocals');

// ROUTES
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const folderRoutes = require('./routes/folders');
const fileRoutes = require('./routes/files');

const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
app.use(setLocals);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return done(null, false, { message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return done(null, false, { message: "Wrong password" });

  return done(null, user);
}));

// PUBLIC PAGE
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// ROUTE SETUP
app.use(authRoutes);
app.use(dashboardRoutes); 
app.use('/folders', folderRoutes);
app.use('/files', fileRoutes);

// START
app.listen(3000, () => {
  console.log("✅ SkyVault running at http://localhost:3000");
});
