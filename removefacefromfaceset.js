const axios = require('axios'); // Use axios to make API requests

// Replace these with your Face++ API credentials
const apiKey = 'BDuuQlwDzlFN17SI3nEHB6s420hBWnBO';
const apiSecret = 'd7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y';
const faceSetToken = '410c99552af55680253a861c97824099'; // Token of the FaceSet from which faces are to be removed

// List of 29 face tokens to be removed (comma-separated)
const faceTokens = [
  'f012beb63a8c3eea4a5deddb5341d0e6',
    'e1d7d65c66722b9a2ceaa4de52d96ebc',
    '64a0dfa85985e30331534b9b17a8ad5b',
    '4ddc6d8fb43e0ba3dfd3deb98796d0ca',
    '5584a73363f729b9c86f67fb81fc4671',
    'c9f0ec6b5b15acdff7cda7040d36f2f0'
].join(',');

// Function to remove faces from a FaceSet
async function removeFacesFromFaceSet() {
  try {
    // API endpoint for removing faces
    const url = 'https://api-us.faceplusplus.com/facepp/v3/faceset/removeface';

    // Prepare the form data to be sent to the API
    const data = new URLSearchParams();
    data.append('api_key', apiKey);
    data.append('api_secret', apiSecret);
    data.append('faceset_token', faceSetToken);
    data.append('face_tokens', faceTokens);

    // Make a POST request to the Face++ API
    const response = await axios.post(url, data);

    // Check if the API returned an error
    if (response.data.error_message) {
      console.error('Error removing faces:', response.data.error_message);
    } else {
      console.log('Faces removed successfully:', response.data);
    }
  } catch (error) {
    console.error('Error removing faces:', error.message);
  }
}

// Call the function to remove faces
removeFacesFromFaceSet();
