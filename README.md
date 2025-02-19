CC19-Facebook-API
===
### env guide
PORT=8899  
DATABASE_URL=***  
JWT_SECRET=***  

---
### Service
|path |method |authen |params |query | body | 
|:--|:--|:--|:--|:--|:--|
|/auth/register |post |-|-|-|{identity, fistName, lastName,password, confirmPassword}
|/auth/login|post|-|-|-|{identity, password}
|/auth/me|get|y|-|-|-|
|/post|get|y|-|-|-|
|/post|post|y|-|-|{message, image(file)}
|/post|put|y|:id|-|{message, image(file)}
|/post|delete|y|:id|-|-
|/comment|post|y|-|-|{message, postId} 
|/like|post|y|-|-|{postId}
|/like|delete|y|:id|-|-

---
## Note
Facebook Project  
Create Api node server facebook project by nodejs and express.js
## Step 1
- Create file Server.js 
```bash
npm init -y
```
- custom file package.json input 
```js
"start": "nodemon server.js"
```
- create .gitignore and update Code
```bash
node_modules/
.env
```
- terminal input 
```bash
git init
```
- create file .env
```bash
PORT=8899
DATABASE_URL=***
JWT_SECRET=***
```
- install package
```bash
npm i express dotenv
```
## Step 2
update code file server.js and start server
```js
require("dotenv").config()
const express = require("express")

const app = express()

const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`Server is running Port ${port}`))
```

## Step 3 Create Error middlewares
/middlewares/notfound.js
```js
module.exports = (req, res) => {
  res.status(404).json({ msg: "Service not found" });
};
```
/middlewares/errorMiddleware.js
```js
module.exports = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: err.message });
};

```
## Step 4 create Routes and Controllers
- auth-controllers.js
```js
module.exports.register = (req, res) => {
    res.json({msg: "Register..."})
}
module.exports.login = (req, res) => {
    res.json({msg: "Login..."})
}
module.exports.getMe = (req, res) => {
    res.json({msg: "Get Me..."})
}
```
- auth-routes.js
```js
const express = require("express")
const { register, login, getMe } = require("../controllers/auth-controllers")
const authRoute = express.Router()

authRoute.post("/register", register)
authRoute.post("/login", login)
authRoute.get("/me", getMe)

module.exports = authRoute
```
## Step 5 Database Prisma
```bash 
npm i -D prisma
npx prisma init
```
prisma
```js

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int            @id @default(autoincrement())
  firstName    String
  lastName     String
  email        String?        @unique
  mobile       String?        @unique
  password     String
  profileImage String?
  coverImage   String?
  createdAt    DateTime       @default(now()) @db.Timestamp(0)
  updatedAt    DateTime       @updatedAt @db.Timestamp(0)
  posts        Post[]
  comments     Comment[]
  likes        Like[]
  senders      Relationship[] @relation(name: "sender")
  receivers    Relationship[] @relation(name: "receiver")
}

model Post {
  id        Int       @id @default(autoincrement())
  message   String?   @db.Text
  image     String?
  createdAt DateTime  @default(now()) @db.Timestamp(0)
  updatedAt DateTime  @updatedAt @db.Timestamp(0)
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  comments  Comment[]
  likes     Like[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  message   String?  @db.Text
  createdAt DateTime @default(now()) @db.Timestamp(0)
  updatedAt DateTime @updatedAt @db.Timestamp(0)
  userId    Int
  postId    Int
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
}

model Like {
  userId    Int
  postId    Int
  createdAt DateTime @default(now()) @db.Timestamp(0)
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

enum RelationshipStatus {
  PENDING
  ACCEPTED
}

model Relationship {
  id         Int                @id @default(autoincrement())
  status     RelationshipStatus @default(PENDING)
  createdAt  DateTime           @default(now()) @db.Timestamp(0)
  updatedAt  DateTime           @updatedAt @db.Timestamp(0)
  senderId   Int
  receiverId Int
  sender     User               @relation(name: "sender", fields: [senderId], references: [id])
  receiver   User               @relation(name: "receiver", fields: [receiverId], references: [id])
}
```
.env
```bash
DATABASE_URL="xxx/cc19-facebook"

```
```bash
npx prisma generate
```
## Step 6 Register and Login
utils/createError.js
```js
module.exports = (statusCode, msg) => {
    const error = new Error(msg)
    error.statusCode = statusCode
    throw(error)
}
```
controllers/auth-controllers.js
```js
const createError = require("../utils/createError");
const prisma = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function checkEmailorMobile(identity) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10,15}$/;

  let identityKey = "";
  if (emailRegex.test(identity)) {
    identityKey = "email";
  }
  if (mobileRegex.test(identity)) {
    identityKey = "mobile";
  }
  if (!identityKey) {
    createError(400, "Only Email or Mobile Phone");
  }
  return identityKey;
}

module.exports.register = async (req, res, next) => {
  try {
    const { identity, firstName, lastName, password, confirmPassword } =
      req.body;
    // validation
    if (
      !(
        identity.trim() &&
        firstName.trim() &&
        lastName.trim() &&
        password.trim() &&
        confirmPassword.trim()
      )
    ) {
      return createError(400, "Please fill all data");
    }

    if (password !== confirmPassword) {
      return createError(400, "Please check confirm-password");
    }

    const identityKey = checkEmailorMobile(identity);

    // find user ?
    const findIdentity = await prisma.user.findUnique({
      where: { [identityKey]: identity },
    });

    if (findIdentity) {
      return createError(409, "Already have this User");
    }

    const newUser = {
      [identityKey]: identity,
      password: await bcrypt.hash(password, 10),
      firstName: firstName,
      lastName: lastName,
    };
    console.log(newUser);

    const result = await prisma.user.create({
      data: newUser,
    });
    console.log(result);
    res.json({ msg: `Register Successful`, result });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { identity, password } = req.body;

    if (!identity.trim() || !password.trim()) {
      return createError(400, "Please fill all data");
    }

    const identityKey = checkEmailorMobile(identity);

    const foundUser = await prisma.user.findUnique({
      where: { [identityKey]: identity },
    });

    if (!foundUser) {
      return createError(401, "Invalid Login");
    }

    let pwOk = await bcrypt.compare(password, foundUser.password);

    if (!pwOk) {
      return createError(401, "Invalid Login");
    }

    // create jwt token
    const payload = { id: foundUser.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ 
        msg: "Login successful",
        user: foundUser,
        token: token,
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports.getMe = (req, res) => {
  res.json({ msg: "Get Me..." });
};

```
### prisma
prisma/resetDB.js
```js
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
}

console.log("Reset DB...")
resetDatabase()
```
prisma/seed.js
```js
const prisma = require("../models");
const bcrypt = require("bcryptjs");

const hashedPassword = bcrypt.hashSync("123456", 10);

const userData = [
  {
    firstName: "Andy",
    lastName: "Codecamp",
    email: "andy@ggg.mail",
    password: hashedPassword,
  },
  {
    firstName: "Bobby",
    lastName: "Codecamp",
    email: "bobby@ggg.mail",
    password: hashedPassword,
  },
  {
    firstName: "Candy",
    lastName: "Codecamp",
    mobile: "1111111111",
    password: hashedPassword,
  },
  {
    firstName: "Danny",
    lastName: "Codecamp",
    mobile: "2222222222",
    password: hashedPassword,
  },
];

console.log("DB seed...");

async function seedDB() {
  await prisma.user.createMany({ data: userData });
}

seedDB()

```
```bash
npx prisma db seed
```





