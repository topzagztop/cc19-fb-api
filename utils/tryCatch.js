// module.exports = (func) => {
//     return (req, res, next) => func(req, res, next).catch(err => next(err))
// }

module.exports = func => {
    return async function (req, res, next) {
        try {
            await func(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}