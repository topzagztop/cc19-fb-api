const createError = require("../utils/createError")
const jwt = require("jsonwebtoken")
const prisma = require("../models")

module.exports = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization

        if(!authorization || !authorization.startsWith('Bearer ')) {
            return createError(401, "Unauthorized 1")
        }

        const token = authorization.split(" ")[1]
        // console.log(token)
        if(!token) {
            return createError(401, "Unauthorized 2")
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(payload)

        // find user in payload
        const foundUser = await prisma.user.findUnique({
            where: {id: payload.id}
        })
        // console.log(foundUser)
        const {password, createdAt, updatedAt, ...userData} = foundUser
        console.log(userData)

        // data user in req.user 
        req.user = userData

        next()
    } catch (error) {
        next(error)
    }
}