const fs = require('fs');
const axios = require('axios');
const https = require('https');
const FormData = require('form-data');
const environment = require('../configs/environments');

const sendRequest = async (url, filePath) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('filename', filePath.split('/').pop());

        const httpsAgent = new https.Agent({
            rejectUnauthorized: false // Allow self-signed certificates
        });

        const requestConfig = {
            httpsAgent,
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${environment.FILE_SERVER_TOKEN}`
            }
        };

        // Create a new Axios instance with the custom configuration
        const axiosInstance = axios.create(requestConfig);

        // Send the request with the form data
        const response = await axiosInstance.post(url, form);

        fs.unlinkSync(filePath);

        return response.data;
    } catch (error) {
        console.error('Error during file upload:', error.message);
        throw error;
    }
};

module.exports = { sendRequest };