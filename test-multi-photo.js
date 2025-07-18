// Test script to debug multi-photo import
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testMultiPhotoImport() {
  try {
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from('test-image-data');
    
    const formData = new FormData();
    formData.append('images', testImageBuffer, 'test1.jpg');
    formData.append('images', testImageBuffer, 'test2.jpg');
    
    const response = await axios.post('http://localhost:3021/api/ai/import/photos', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testMultiPhotoImport();