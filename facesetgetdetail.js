const axios = require('axios'); // Use axios to make API requests

// Replace these with your Face++ API credentials
const apiKey = 'BDuuQlwDzlFN17SI3nEHB6s420hBWnBO';
const apiSecret = 'd7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y';
const faceSetToken = '410c99552af55680253a861c97824099'; // Token of the FaceSet you want to retrieve details for

// Function to get FaceSet details
async function getFaceSetDetails() {
  try {
    // API endpoint for getting FaceSet details
    const url = 'https://api-us.faceplusplus.com/facepp/v3/faceset/getdetail';

    // Prepare the form data to be sent to the API
    const data = new URLSearchParams();
    data.append('api_key', apiKey);
    data.append('api_secret', apiSecret);
    data.append('faceset_token', faceSetToken);

    // Make a POST request to the Face++ API
    const response = await axios.post(url, data);

    // Check if the API returned an error
    if (response.data.error_message) {
      console.error('Error retrieving FaceSet details:', response.data.error_message);
    } else {
      console.log('FaceSet details retrieved successfully:', response.data);
    }
  } catch (error) {
    console.error('Error retrieving FaceSet details:', error.message);
  }
}

// Call the function to get FaceSet details
getFaceSetDetails();
