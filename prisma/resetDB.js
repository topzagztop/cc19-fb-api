require("dotenv").config()
const prisma = require("../models")

// beware order of table to delete
async function resetDatabase() {
    await prisma.$transaction([
        prisma.comment.deleteMany(),
        prisma.like.deleteMany(),
        prisma.post.deleteMany(),
        prisma.relationship.deleteMany(),
        prisma.user.deleteMany(),
    ])
    await prisma.$executeRawUnsafe('Alter Table user auto_increment=1;')
}

// async function resetDatabase() {
//     const tableNames = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'))

//     for(let table of tableNames) {
//         await prisma[table].delete.many()
//         await prisma.$executeRawUnsafe(`Alter Table \`${table}\` auto_increment = 1 `)
//     }
// }

console.log("Reset DB...")
resetDatabase()