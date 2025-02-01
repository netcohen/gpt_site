require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ✅ חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ מחובר ל-MongoDB'))
  .catch(err => console.log('❌ שגיאה בחיבור ל-MongoDB:', err));

// ✅ סכמות למערכת
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const MessageSchema = new mongoose.Schema({
  user: String,
  text: String,
  recipient: String,
  timestamp: { type: Date, default: Date.now }
});

const AppointmentSchema = new mongoose.Schema({
  date: Date,
  client: String,
  trainer: String,
  description: String,
  color: String // 🎨 תוספת: צבע מותאם לכל אירוע
});

const TaskSchema = new mongoose.Schema({
  description: String,
  completed: Boolean,
  assignedTo: String, // לכל משתמש יש משימות משלו
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
const Task = mongoose.model('Task', TaskSchema);

// ✅ התחברות
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// ✅ Middleware לאימות משתמשים
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'גישה נדחתה' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'טוקן לא חוקי' });
  }
};

// ✅ שליפת כל המאלפים
app.get('/trainers', authenticate, async (req, res) => {
  const trainers = await User.find({ role: 'trainer' });
  res.json(trainers);
});

// ✅ שליפת כל הלקוחות
app.get('/clients', authenticate, async (req, res) => {
  const clients = await User.find({ role: 'client' });
  res.json(clients);
});

// ✅ שליפת הודעות צ'אט (ממוין לפי זמן)
app.get('/chat/messages', authenticate, async (req, res) => {
  const messages = await Message.find()
    .sort({ timestamp: 1 });
  res.json(messages);
});

// ✅ שליחת הודעה בצ'אט (כולל תמיכה במקבל)
app.post('/chat/messages', authenticate, async (req, res) => {
  const { text, recipient } = req.body;
  const newMessage = new Message({ user: req.user.username, text, recipient });
  await newMessage.save();
  io.emit('receiveMessage', newMessage);
  res.json(newMessage);
});

// ✅ שליפת פגישות (כולל צבעים מותאמים)
app.get('/appointments', authenticate, async (req, res) => {
  let appointments;
  if (req.user.role === 'trainer') {
    appointments = await Appointment.find({ trainer: req.user.username });
  } else {
    appointments = await Appointment.find({ client: req.user.username });
  }
  res.json(appointments);
});

// ✅ הוספת פגישה חדשה (כולל בחירת צבע 🎨)
app.post('/appointments', authenticate, async (req, res) => {
  const { date, client, description, color } = req.body;
  const newAppointment = new Appointment({ date, client, trainer: req.user.username, description, color });
  await newAppointment.save();
  res.json(newAppointment);
});

// ✅ שליפת משימות של משתמש
app.get('/tasks', authenticate, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.username });
  res.json(tasks);
});

// ✅ הוספת משימה חדשה
app.post('/tasks', authenticate, async (req, res) => {
  const { description } = req.body;
  const newTask = new Task({ description, completed: false, assignedTo: req.user.username });
  await newTask.save();
  res.json(newTask);
});

// ✅ עדכון משימה (סימון כבוצעה)
app.put('/tasks/:id', authenticate, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { completed: true });
  res.json({ message: "משימה עודכנה בהצלחה" });
});

// ✅ מחיקת משימה
app.delete('/tasks/:id', authenticate, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "משימה נמחקה בהצלחה" });
});

// ✅ WebSocket - צ'אט
io.on("connection", (socket) => {
  console.log("📡 משתמש התחבר:", socket.id);

  socket.on("sendMessage", async (data) => {
    const newMessage = new Message({ user: data.user, text: data.text, recipient: data.recipient });
    await newMessage.save();
    io.emit("receiveMessage", newMessage);
  });

  socket.on("typing", (data) => {
    io.emit("userTyping", { user: data.user });
  });

  socket.on("disconnect", () => {
    console.log("📡 משתמש התנתק:", socket.id);
  });
});

// ✅ הפעלת השרת
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 השרת רץ על פורט ${PORT}`));
