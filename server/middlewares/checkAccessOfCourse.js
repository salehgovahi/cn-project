const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const config = require('../configs/environments');
const Errors = require('../const/errors');
const rolesDbFunctions = require('../services/roles/dbFunctions')

const validateRequest = async (req, res, next) => {
    const { authorization } = req.headers;
    const { course_id } = req.params; // Adjust based on your route structure

    try {
        const currentUrl = req.originalUrl;
        const currentMethod = req.method;

        let updatedUrl = currentUrl.replace(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
            '#'
        );

        if (!authorization) {
            const error = Errors.Token_Not_Exist;
            throw error;
        }

        const token = authorization.substring('Bearer '.length);
        if (!token) {
            const error = Errors.Token_Not_Exist;
            throw error;
        }

        const { user_id } = jwt.verify(token, config.JWT_SECRET_KEY);

        const paths = await prisma.$queryRaw`
            SELECT a.*
            FROM accesses a
            WHERE a.path = ${updatedUrl} AND a.method = ${currentMethod} AND a.id IN (
                SELECT ra.access_id
                FROM role_access ra
                WHERE ra.role_id IN (
                    SELECT ur.role_id
                    FROM user_role ur
                    WHERE ur.user_id::text = ${user_id}
                )
            )
        `;

        if (paths.length > 0 && paths[0].path === updatedUrl && paths[0].method === currentMethod) {
            
            const hasAccess = await checkAccessOfUserForCourse(user_id, req.params.course_id);
            if (!hasAccess) {
                const error = Errors.Access_Denied;
                throw error;
            }

            req.user_id = user_id;
            next();
        } else {
            const error = Errors.Access_Denied;
            throw error;
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            err = Errors.Token_Expired;
        }
        return next(err);
    }
};

const checkAccessOfUserForCourse = async (user_id, course_id) => {
    try {        
        const isTeacherOfCourse = await prisma.course_user.findFirst({
            where: {
                course_id: course_id,
                user_id: user_id,
                role: 'teacher'
            }
        });

        const adminRole = await rolesDbFunctions.getRoleByName("admin")

        const isAdmin = await prisma.user_role.findFirst({
            where: {
                user_id: user_id,
                role_id: adminRole.id
            }
        });      

        return !!isTeacherOfCourse || !!isAdmin;
    } catch (err) {
        throw err
    }
};

module.exports = validateRequest;