const axios = require('axios'); // Use axios to make API requests

// Replace these with your Face++ API credentials
const apiKey = 'BDuuQlwDzlFN17SI3nEHB6s420hBWnBO';
const apiSecret = 'd7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y';
const faceSetToken = '410c99552af55680253a861c97824099'; // The token for the face set you want to delete

// Create a function to delete the face set
async function deleteFaceSet() {
  try {
    // Prepare the API URL for deleting a face set
    const url = 'https://api-us.faceplusplus.com/facepp/v3/faceset/delete';

    // Prepare the form data to be sent to the API
    const data = new URLSearchParams();
    data.append('api_key', apiKey);
    data.append('api_secret', apiSecret);
    data.append('faceset_token', faceSetToken);

    console.log('faceset_token:', faceSetToken);


    // Make a POST request to delete the face set
    const response = await axios.post(url, data);

    console.log('response:', response);


    // Check the response and handle it
    if (response.data.error_message) {
      console.log('Error deleting face set:', response.data.error_message);
    } else {
      console.log('Face set deleted successfully:', response.data);
    }
  } catch (error) {
    console.error('Error deleting face set:', error.message);
  }
}

deleteFaceSet()