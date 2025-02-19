require("dotenv").config();

const morgan = require("morgan")
const helmet = require("helmet")
const express = require("express");
const cors = require("cors")
const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoute = require("./routes/auth-routes");
const postRoute = require("./routes/post-routes");
const authenticate = require("./middlewares/authenticate");
const app = express();

// app.use(cors({
//     origin : "http://localhost:5173"
// }))
app.use(cors())
app.use(morgan(":method : url :status LENGTH : res[content-length] - :response-time ms"))
app.use(helmet());
app.use(express.json())


app.use("/post", authenticate, postRoute);
app.use("/auth", authRoute);
app.use("/post", (req, res) => {res.send("post service")});
app.use("/comment", (req, res) => {res.send("comment service")});
app.use("/like", (req, res) => {res.send("like service")});

// notFound
app.use( notFound );

// error Middleware
app.use(errorMiddleware)

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running Port ${port}`));
