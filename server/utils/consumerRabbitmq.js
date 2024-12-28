const amqp = require('amqplib');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const environments = require('../configs/environments');
const HttpError = require('../utils/httpError');
const Errors = require('../const/errors');

const receiveVideosStatus = async (queue) => {
    let connection;

    try {
        connection = await amqp.connect(
            `amqp://${environments.RABBITMQ_USER}:${environments.RABBITMQ_PASSWORD}@${environments.RABBITMQ_SERVER_IP}:${environments.RABBITMQ_SERVER_PORT}`
        );
        const channel = await connection.createChannel();
        const queueName = queue;

        await channel.assertQueue(queueName, { durable: false });

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());

                let {id, status, video_length } = message;
                
                const related_to = await getVideoRelatedTo(id)

                try {
                    if (related_to == 'course') {
                        await updateCourseVideoStatus(id, status);
                    } else if (related_to == 'unit') {
                        await updateUnitVideoStatus(id, status, video_length);
                    }
                } catch (error) {
                    console.error(`Error removing output directory: ${error.message}`);
                }

                channel.ack(msg);
            }
        });
    } catch (err) {
        console.warn(err);
    }
};

const getVideoRelatedTo = async (id) => {
    try {
        const existingCourse = await prisma.courses.findFirst({
            where: {
                id: id
            }
        });

        const existingUnit = await prisma.units.findFirst({
            where: {
                id: id
            }
        })

        if (existingCourse) {
            return "course"
        }
        if (existingUnit) {
            return "unit"
        }
        
    } catch (err) {
        console.log(err);
        const error = new HttpError(Errors.Something_Went_Wrong);
        throw error;
    }
}

const updateCourseVideoStatus = async (related_to_id, status) => {
    try {
        const existingCourse = await prisma.courses.findFirst({
            where: {
                id: related_to_id
            }
        });
        if (!existingCourse) {
            const error = new HttpError(Errors.Course_Undefined);
            throw error;
        }

        let content_id = await prisma.courses.findMany({
            where: {
                id: related_to_id
            },
            select: {
                content_id: true
            }
        });

        content_id = content_id[0].content_id;

        const uploadedVideo = await prisma.course_content.update({
            where: {
                id: content_id
            },
            data: {
                advertisement_video: status
            }
        });
    } catch (err) {
        console.log(err);
        const error = new HttpError(Errors.Something_Went_Wrong);
        throw error;
    }
};

const updateUnitVideoStatus = async (related_to_id, status, videoLength) => {
    try {
        if ( videoLength == undefined ) {
            videoLength = 0
        }

        const existingUnit = await prisma.units.findFirst({
            where: {
                id: related_to_id
            },
            include: {
                chapters: {
                    include: {
                        courses: true // Include the course information
                    }
                }
            }
        });

        if (!existingUnit) {
            const error = new HttpError(Errors.Unit_Undefined);
            throw error;
        }

        // Update the unit with the new video and video length
        let updatedUnit = await prisma.units.update({
            where: {
                id: related_to_id
            },
            data: {
                video: status,
                video_length: videoLength
            }
        });

        // Now get the course ID from the unit's chapter
        const course_id = existingUnit.chapters.courses.id; // Assuming there is a relation set up that allows access to `courses` from `chapters`

        // Increment the length_time in course_statistics
        await prisma.course_statistics.updateMany({
            where: {
                courses: {
                    some: {
                        id: course_id
                    }
                }
            },
            data: {
                length_time: {
                    increment: videoLength
                }
            }
        });
    } catch (err) {
        console.log(err);
        const error = new HttpError(Errors.Something_Went_Wrong);
        throw error;
    }
};

module.exports = {
    receiveVideosStatus
};
