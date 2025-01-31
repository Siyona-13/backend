//const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { MongoClient, ServerApiVersion } = require("mongodb");

//const app = express();
const app = process.env.PORT;

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

// Face++ API Credentials
const apiKey = "BDuuQlwDzlFN17SI3nEHB6s420hBWnBO";
const apiSecret = "d7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y";
const facesetToken = "410c99552af55680253a861c97824099";

// MongoDB Connection
const uri = "mongodb+srv://siyona:Siyona123@cluster0.ua1cn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db;

// Connect to MongoDB and handle errors properly
(async () => {
  try {
    await client.connect();
    db = client.db("attendance");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
})();

// Utility function for delay
const oneSecondBreak = () => new Promise(resolve => setTimeout(resolve, 1000));

// ✅ **ADD FACE API**
app.post("/add-face", async (req, res) => {
  const { name, photo } = req.body;

  if (!name || !photo) {
    return res.status(400).json({ error: "❌ Name and photo are required" });
  }

  try {
    // Step 1: Save the image temporarily in /tmp/
    const photoName = `photo_${Date.now()}.jpg`;
    const filePath = path.join("/tmp/", photoName);
    fs.writeFileSync(filePath, Buffer.from(photo, "base64"));

    // Step 2: Upload to Face++ for face detection
    const form = new FormData();
    form.append("api_key", apiKey);
    form.append("api_secret", apiSecret);
    form.append("image_file", fs.createReadStream(filePath));

    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", form, { headers: form.getHeaders() });

    const faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      return res.status(404).json({ error: "❌ No face detected in the photo" });
    }

    console.log("✅ Detected Face Token:", faceToken);

    // Step 3: Add Face to FaceSet
    await oneSecondBreak();
    await axios.post("https://api-us.faceplusplus.com/facepp/v3/faceset/addface", null, {
      params: { api_key: apiKey, api_secret: apiSecret, faceset_token: facesetToken, face_tokens: faceToken },
    });

    // Step 4: Save to MongoDB
    await db.collection("users").insertOne({ name, faceToken });

    res.status(200).json({ message: "✅ Face added successfully!", name });
  } catch (error) {
    console.error("❌ Error processing the photo:", error.message);
    res.status(500).json({ error: "Failed to add face", details: error.message });
  }
});

// ✅ **SEARCH & MARK ATTENDANCE API**
app.post("/search-face", async (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "❌ Photo is required" });
  }

  try {
    // Step 1: Save image temporarily
    const photoName = `photo_${Date.now()}.jpg`;
    const filePath = path.join("/tmp/", photoName);
    fs.writeFileSync(filePath, Buffer.from(photo, "base64"));

    // Step 2: Detect face
    const form = new FormData();
    form.append("api_key", apiKey);
    form.append("api_secret", apiSecret);
    form.append("image_file", fs.createReadStream(filePath));

    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", form, { headers: form.getHeaders() });

    const faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      throw new Error("❌ No face detected in the photo");
    }

    console.log("✅ Detected face token:", faceToken);

    // Step 3: Search Face++ FaceSet
    await oneSecondBreak();
    const searchResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/search", null, {
      params: { api_key: apiKey, api_secret: apiSecret, face_token: faceToken, faceset_token: facesetToken },
    });

    const bestMatch = searchResponse.data.results?.[0];
    if (!bestMatch || bestMatch.confidence < 70) {
      throw new Error("❌ No confident face match found");
    }

    // Step 4: Lookup user in MongoDB
    const user = await db.collection("users").findOne({ faceToken: bestMatch.face_token });
    if (!user) {
      throw new Error("❌ Unknown user");
    }

    const name = user.name || "Unknown User";

    // ✅ FIXED ATTENDANCE TIME
    const now = new Date();
    const attendanceTime = `${now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} - ${now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`;

    // Save attendance to DB
    await db.collection("attendance").insertOne({ name, attendanceTime });

    res.status(200).json({ success: true, message: "✅ Attendance marked!", name: user.name, time: attendanceTime });
  } catch (error) {
    console.error("❌ Error marking attendance:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* 🚀 **Commented Express Server Code (For Vercel Deployment)** */
// app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));

module.exports = app;
