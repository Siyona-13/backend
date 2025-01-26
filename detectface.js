app.post("/detect-face", async (req, res) => {
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "Photo is required" });
  }

  try {
    const detectResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/detect", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        image_base64: photo, // Process base64 image
      },
    });

    const faceToken = detectResponse.data.faces[0]?.face_token;
    if (!faceToken) {
      return res.status(404).json({ error: "No face detected in the photo" });
    }

    res.status(200).json({
      message: "Face detected successfully!",
      faceToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Error detecting face", details: error.message });
  }
});


