const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const HttpError = require('../utils/httpError');
const Errors = require('../const/errors');
const config = require('../configs/environments');

const roleDbFunctions = require('../services/roles/dbFunctions')

const checkSignup = async (req, res, next) => {
    const { authorization } = req.headers;
    const course_id = req.params.course_id;

    try {
        const token = authorization.substring('Bearer '.length);

        console.log(token);    

        if (!token) {
            throw new HttpError(Errors.Token_Not_Exist);
        }

        const { user_id } = jwt.verify(token, config.JWT_SECRET_KEY);

        const signupStatus = await checkSignupStatus(user_id,course_id);

        const adminRoleId = await roleDbFunctions.getRoleByName("admin").id

        isAdmin = await roleDbFunctions.getAssignedRolesToUser(user_id,adminRoleId)
        
        // if (!isAdmin){
            if(!signupStatus) {
                throw new HttpError(Errors.signup_status_course);
            }
        // }

        req.user_id = user_id;
        next();
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            throw new HttpError(Errors.Token_Expired);
        } else {
            return next(err);
        }
    }
};

const checkSignupStatus = async (user_id, course_id) => {
    try {
        const foundedUser = await prisma.course_user.findFirst({
            where: {
                course_id: course_id,
                user_id: user_id
            }
        });        

        return foundedUser;
    } catch (error) {
        throw error;
    }
};

module.exports =  checkSignup ;
