const axios = require('axios');

// Face++ API credentials
const apiKey = "BDuuQlwDzlFN17SI3nEHB6s420hBWnBO"; // Replace with your actual API key
const apiSecret = "d7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y"; // Replace with your actual API secret
const facesetToken = "410c99552af55680253a861c97824099"; // Replace with your FaceSet token from Step 1

// Function to detect face and add it to the FaceSet
async function addFaceToFaceSet(photoBase64) {
  try {
 const addFaceResponse = await axios.post("https://api-us.faceplusplus.com/facepp/v3/faceset/addface", null, {
      params: {
        api_key: apiKey,
        api_secret: apiSecret,
        faceset_token: facesetToken, // Your FaceSet token
        face_tokens: "456c039bb0c5b8f4de891f3564e8c3f2",      // The face token you just detected
      },
    });    console.log('Face added to FaceSet successfully:', addFaceResponse.data);
  } catch (error) {
    console.error('Error adding face to FaceSet:', error.message);
  }
}

// Call the function with a sample base64-encoded image (from the webcam)
// For example, you can call it from a frontend input or webcam capture
const sampleBase64Image = "BASE64_ENCODED_IMAGE"; // Replace with the base64 string from your frontend webcam capture

addFaceToFaceSet(sampleBase64Image);
