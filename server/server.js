const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");  // Import cors
const fs = require("fs");      // Import fs to handle file system operations
const path = require("path");  // Import path for handling file paths
const FormData = require("form-data"); // Import form-data
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT   // Use Vercel's port or 5000 for local development



const oneSecondBreak = () => {
  return new Promise(resolve => setTimeout(resolve, 1000));  // 1000 milliseconds = 1 second
};

// Middleware to parse JSON data
app.use(bodyParser.json({ limit: '1000mb' }));

// Use CORS middleware here after initializing the app
app.use(cors());

// Face++ API credentials
const apiKey = "BDuuQlwDzlFN17SI3nEHB6s420hBWnBO"; // Replace with your actual API key
const apiSecret = "d7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y"; // Replace with your actual API secret
const facesetToken = "410c99552af55680253a861c97824099"; // Replace with your existing FaceSet token


// Define the MongoDB connection string
const uri = "mongodb+srv://siyona:Siyona123@cluster0.ua1cn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB Atlas connection string

// Create a MongoClient with MongoClientOptions to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Declare `db` variable outside to make it globally accessible
let db;

(async () => {
  try {
    await client.connect();
    db = client.db("attendance"); // Replace with your database name
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
})();

// 1. Add Face (Detect & Add to FaceSet)
app.post("/add-face", async (req, res) => {
  const { name, photo } = req.body;

  console.log("Name:", name);
  //console.log("Photo:", photo);

  if (!name || !photo) {
    return res.status(400).json({ error: "Name and photo are required" });
  }
let faceToken;
  try {
    // Step 1: Save the base64 photo to a file
      const photoName = `photo_${name}.jpg`; // Example photo name

    const buffer = Buffer.from(photo, "base64");  // Convert base64 to buffer
    const filePath = path.join(__dirname, "uploads", photoName); // Save to 'photos' folder
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Photo saved as: ${photoName}`);

    // Step 2: Create form data for Face++ API request
    const form = new FormData();
    form.append("api_key", apiKey);
    form.append("api_secret", apiSecret);
    form.append("image_file", fs.createReadStream(filePath));  // Append the file from the saved path

    // Step 3: Send POST request to Face++ API to detect face
    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", form, {
      headers: form.getHeaders(),
    });

     faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      return res.status(404).json({ error: "No face detected in the photo" });
    }

    console.log("Detected Face Token:", faceToken);


    await oneSecondBreak(); // Waits for the break to complete
    
    // Step 4: Add face to FaceSet
    const addFaceResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/faceset/addface", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        faceset_token: facesetToken, // Your FaceSet token
        face_tokens: faceToken,      // The face token you just detected
      },
    });
console.log("face added to faceset")
    res.status(200).json({
      message: "Face added successfully to FaceSet",
      data: addFaceResponse.data,
    });
  } catch (error) {
    console.error("Error processing the photo:", error);
    res.status(500).json({ error: "Failed to add face to FaceSet", details: error.message });
  }

  try {
    // Ensure client is connected
    // if (!client.isConnected()) {
    //   await client.connect();
    // }

    const newUser = { name, faceToken };
    const collection = client.db("attendance").collection("users"); // Replace with actual names
    await collection.insertOne(newUser); // Save to MongoDB
   // res.status(200).json({ message: "Face added successfully" });
   console.log("name along with faceToken is sent to database")
  } catch (error) {
    console.error("Error adding face:", error);
    //res.status(500).json({ error: "Error adding face", details: error.message });
  }
});

app.post("/search-face", async (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "Photo is required" });
  }

  try {
    // Step 1: Save the base64 photo to a file
    const photoName = `photo_${Date.now()}.jpg`; // Generate unique photo name
    const buffer = Buffer.from(photo, "base64"); // Convert base64 to buffer
    const filePath = path.join(__dirname, "uploads", photoName); // Save to 'uploads' folder
    fs.writeFileSync(filePath, buffer);

    console.log(`Photo saved as: ${photoName}`);

    // Step 2: Create form data for Face++ API request
    const form = new FormData();
    form.append("api_key", apiKey);
    form.append("api_secret", apiSecret);
    form.append("image_file", fs.createReadStream(filePath)); // Append the file from the saved path

    // Step 3: Send POST request to Face++ API to detect face
    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", form, {
      headers: form.getHeaders(),
    });

    const faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      throw new Error("No face detected in the photo");
    }

    console.log("Detected face token:", faceToken);

    // Step 4: Search for the detected face in the FaceSet
    await oneSecondBreak();

    const searchResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/search", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        face_token: faceToken,
        faceset_token: facesetToken,
      },
    });

    const candidates = searchResponse.data.results;
    if (!candidates || candidates.length === 0) {
      throw new Error("No matching face found");
    }

    const bestMatch = candidates[0];
    const confidence = bestMatch.confidence;

    if (confidence < 70) {
      throw new Error("Face match not confident enough");
    }
       console.log("DB:",db);
    // Step 5: Fetch name from the database using bestMatchToken
    const bestMatchToken = bestMatch.face_token; // Use this token for database lookup
    const user = await db.collection("users").findOne({ faceToken: bestMatchToken });

    if (!user) {
      throw new Error("Unknown user");
    }

    // Attendance marked successfully
    const name = user.name || "Unknown User";
    const attendanceTime = new Date();
    const indianTime = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(attendanceTime);

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      name,
      attendanceTime:indianTime,
    });
  } catch (error) {
    console.error("Error marking attendance:", error.message);
    res.status(500).json({ success: false, error: error.message });
}
});


// // Start server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

module.exports = app;
