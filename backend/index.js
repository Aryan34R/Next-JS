// require("dotenv").config();
// const express = require("express");
// const { PrismaClient } = require("@prisma/client");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");

// const app = express();
// const prisma = new PrismaClient();
// app.use(bodyParser.json());
// app.use(cors());

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// // Registration Endpoint
// app.post("/register", async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, role } = req.body;
//     const userRole = parseInt(role) || 3;
//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { 
//         firstName, 
//         lastName, 
//         email, 
//         password: hashedPassword,
//         role: userRole 
//       },
//     });
//     res.status(201).json({ message: "User created successfully", user });
//   } catch (error) {
//     console.error("Registration Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Login Endpoint
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
//     // Sign token with 'id'
//     const token = jwt.sign(
//       {
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );
//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Get All Users
// app.get("/users", async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.json(users);
//   } catch (error) {
//     console.error("Fetch Users Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.delete("/users/:id", async (req, res) => {
//   const userId = parseInt(req.params.id);

//   try {
//     const deletedUser = await prisma.user.delete({
//       where: { id: userId },
//     });

//     res.json({ message: "User deleted", user: deletedUser });
//   } catch (error) {
//     console.error("Delete Error:", error);
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// });

// /////
// app.put("/users/:id", async (req, res) => {
//   const userId = parseInt(req.params.id);
//   const { firstName, lastName, email, password, role } = req.body;

//   try {
//     const dataToUpdate = {
//       firstName,
//       lastName,
//       email,
//       role,
//     };

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       dataToUpdate.password = hashedPassword;
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: dataToUpdate,
//     });

//     res.json({ message: "User updated", user: updatedUser });
//   } catch (error) {
//     console.error("Update Error:", error);
//     res.status(500).json({ error: "Failed to update user" });
//   }
// });
// // Projects Endpoints

// // Get Projects
// app.get("/projects", async (req, res) => {
//   const token = req.headers.authorization?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     // (The filtering logic below may be adjusted as needed)
//     const projects = await prisma.project.findMany({
//       include: {
//         assignedByUser: true,
//         assignedToUser: true,
//       },
//     });
//     res.json(projects);
//   } catch (err) {
//     console.error("Error fetching projects:", err);
//     res.status(500).json({ error: "Failed to fetch projects" });
//   }
// });

// // Create Project
// app.post("/projects", async (req, res) => {
//   const { name, clientName, status, assignedTo } = req.body;
//   const token = req.headers.authorization?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     // IMPORTANT: Use decoded.id instead of decoded.userId.
//     const project = await prisma.project.create({
//       data: {
//         name,
//         clientName,
//         status,
//         assignedBy: decoded.id, // Fixed: using id from token
//         assignedTo: parseInt(assignedTo),
//       },
//     });
//     res.status(201).json(project);
//   } catch (err) {
//     console.error("Error creating project:", err);
//     res.status(500).json({ error: "Failed to create project" });
//   }
// });

// // Update Project (HR only)
// app.put("/projects/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   const { name, description, status, ownerId } = req.body;
//   const token = req.headers.authorization?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     if (decoded.role !== 2)
//       return res.status(403).json({ error: "Only HR can update projects" });
//     const updated = await prisma.project.update({
//       where: { id },
//       data: { name, description, status, ownerId: parseInt(ownerId) },
//     });
//     res.json(updated);
//   } catch (err) {
//     console.error("Update Error:", err);
//     res.status(500).json({ error: "Failed to update project" });
//   }
// });

// // Delete Project (HR only)
// app.delete("/projects/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   const token = req.headers.authorization?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     if (decoded.role !== 2)
//       return res.status(403).json({ error: "Only HR can delete projects" });
//     await prisma.project.delete({ where: { id } });
//     res.json({ message: "Project deleted" });
//   } catch (err) {
//     console.error("Delete Error:", err);
//     res.status(500).json({ error: "Failed to delete project" });
//   }
// });

// // Attendance Endpoints

// app.post("/attendance", async (req, res) => {
//   const { employeeId, inTime, outTime } = req.body;
//   try {
//     const attendance = await prisma.attendance.create({
//       data: {
//         employeeId: parseInt(employeeId),
//         inTime: inTime ? new Date(inTime) : null,
//         outTime: outTime ? new Date(outTime) : null,
//       },
//     });
//     res.status(201).json(attendance);
//   } catch (err) {
//     console.error("Attendance Error:", err);
//     res.status(500).json({ error: "Failed to save attendance" });
//   }
// });

// app.get('/api/attendance/:employeeId', async (req, res) => {
//   const { employeeId } = req.params;
//   try {
//     const records = await prisma.attendance.findMany({
//       where: { employeeId: parseInt(employeeId) },
//       orderBy: { date: 'desc' },
//     });
//     res.json(records);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch attendance' });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server is running on port 5000");
// });

/// socket
require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Create HTTP server and attach socket.io to it.
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, set this to your actual domain.
    methods: ["GET", "POST"]
  }
});

// Socket.io Integration
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Listen for user status updates sent by clients.
  socket.on("userStatus", (data) => {
    // Expects a payload like: { userId: number, status: "active" | "away" }
    console.log("Received status update:", data);
    // Broadcast the status update to all connected clients.
    io.emit("statusUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ---------------------
// Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const userRole = parseInt(role) || 3;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword,
        role: userRole 
      },
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Sign token with 'id'
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });
    res.json({ message: "User deleted", user: deletedUser });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const dataToUpdate = {
      firstName,
      lastName,
      email,
      role,
    };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ---------------------
// Projects Endpoints

app.get("/projects", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const projects = await prisma.project.findMany({
      include: {
        assignedByUser: true,
        assignedToUser: true,
      },
    });
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/projects", async (req, res) => {
  const { name, clientName, status, assignedTo } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        status,
        assignedBy: decoded.id,
        assignedTo: parseInt(assignedTo),
      },
    });
    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.put("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, status, ownerId } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 2)
      return res.status(403).json({ error: "Only HR can update projects" });
    const updated = await prisma.project.update({
      where: { id },
      data: { name, description, status, ownerId: parseInt(ownerId) },
    });
    res.json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

app.delete("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 2)
      return res.status(403).json({ error: "Only HR can delete projects" });
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ---------------------
// Attendance Endpoints

app.post("/attendance", async (req, res) => {
  const { employeeId, inTime, outTime } = req.body;
  try {
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        inTime: inTime ? new Date(inTime) : null,
        outTime: outTime ? new Date(outTime) : null,
      },
    });
    res.status(201).json(attendance);
  } catch (err) {
    console.error("Attendance Error:", err);
    res.status(500).json({ error: "Failed to save attendance" });
  }
});

app.get('/api/attendance/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const records = await prisma.attendance.findMany({
      where: { employeeId: parseInt(employeeId) },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Start the server using the HTTP server (with socket.io attached)
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
