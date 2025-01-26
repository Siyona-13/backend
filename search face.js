// 3. Search Face
app.post("/search-face", async (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "Photo is required" });
  }

  try {
    // Step 5: Send the photo for face detection
    oneSecondBreak();
    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        image_base64: photo,
      },
    });

    const faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      return res.status(404).json({ error: "No face detected in the photo" });
    }

    // Step 6: Search for the detected face in the FaceSet
    const searchResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/search", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        face_token: faceToken,
        faceset_token: facesetToken,
      },
    });

    const results = searchResponse.data.results;

    if (results && results.length > 0) {
      const matchedFace = results[0];
      return res.status(200).json({
        message: "Face found in FaceSet",
        confidence: matchedFace.confidence,
        user_id: matchedFace.user_id, // If you set `user_id` during face addition
      });
    } else {
      return res.status(404).json({ error: "No matching face found in the FaceSet" });
    }
  } catch (error) {
    console.error("Error searching for face:", error);
    res.status(500).json({ error: "Failed to search for face", details: error.message });
  }
});
