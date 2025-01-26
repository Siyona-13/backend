const axios = require('axios');

const createFaceSetUrl = 'https://api-us.faceplusplus.com/facepp/v3/faceset/create';
const apiKey = "BDuuQlwDzlFN17SI3nEHB6s420hBWnBO"; // Replace with your actual API key
const apiSecret = "d7GMgc9-Nf6zfNlwlPhBRCA3X8aNoW9Y"; // Replace with your actual API secret

axios.post(createFaceSetUrl, null, {
  params: {
    api_key: apiKey,
    api_secret: apiSecret,
    display_name: "MyFaceSet2", // A name for your FaceSet
    outer_id: "myfaceset_id", // Optional: Custom ID to reference your FaceSet
  },
})
  .then(response => {
    console.log("FaceSet created successfully:", response.data);
    console.log("FaceSet Token:", response.data.faceset_token);
  })
  .catch(error => {
    console.error("Error creating FaceSet:", error.response.data);
  });
