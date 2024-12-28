const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const environments = require('../configs/environments');
const courseDbFunctions = require('../services/courses/content/dbFunctions');
const unitDbFunctions = require('../services/courses/units/dbFunctions')

const checkVideosStatus = async () => {
    try {
        const videosToCheck = await getPendingVideos();
        for (const video of videosToCheck) {            
            const videoUrl = await checkVideoOnFileServer(video.name);            

            if (videoUrl) {
                if (video.related_to === 'course') {
                    courseDbFunctions.uploadVideo(video.related_to_id, videoUrl);
                    await prisma.videos_to_convert.delete({
                        where: {
                            id: video.id
                        }
                    })                    
                }
                else if (video.related_to === 'unit') {
                    await unitDbFunctions.updateVideoUrl(video.related_to_id, videoUrl);
                    await prisma.videos_to_convert.delete({
                        where: {
                            id: video.id
                        }
                    })                    
                }
            }
        }
    } catch (error) {
    }
};

const getPendingVideos = async () => {
    try {
        const pendingVideos = await prisma.videos_to_convert.findMany({});

        return pendingVideos;
    } catch (error) {
        console.error('Error during file upload:', error.message);
        throw error;
    }
};

const checkVideoOnFileServer = async (videoName) => {
    try {
        const checkVideoUrl = `${environments.FILE_SERVER_CHECK_VIDEO_URL}${videoName}`;

        const request_config = {
            headers: {
                Authorization: `Bearer ${environments.FILE_SERVER_TOKEN}`
            }
        };

        const response = await axios.get(checkVideoUrl, request_config);        

        if (response.status == 400) {
            return false;
        }

        if (response.status == 200) {
            return response.data.video_url;
        }
    } catch (error) {
    }
};

module.exports = checkVideosStatus;
