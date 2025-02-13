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



