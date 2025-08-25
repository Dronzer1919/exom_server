const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testBannerUpload() {
  const form = new FormData();
  form.append('banner', fs.createReadStream('uploads/test-banner.jpg'));
  try {
    const res = await axios.post('http://localhost:3000/create-banner', form, {
      headers: form.getHeaders()
    });
    console.log('Banner upload response:', res.data);
  } catch (err) {
    console.error('Banner upload error:', err.response?.data || err.message);
  }
}

testBannerUpload();
