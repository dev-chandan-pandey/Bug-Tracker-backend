// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { userRouter } = require("./routes/user.routes");
// const { connection } = require("./config/db");

// const app = express();
// /////
// app.use(cors());
// app.use(express.json());

// app.use("/api", userRouter);

// app.get("/", (req, res) => {
//   try {
//     res.status(200).send({ msg: "This is Our Homepage." });
//   } catch (error) {
//     console.log("Error", error);
//   }
// });

// app.listen(process.env.PORT, async () => {
//   try {
//     await connection;
//     console.log(`Server is running at http://localhost:${process.env.PORT}`);
//   } catch (error) {
//     console.log("Error", error);
//   }
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const helmet = require('helmet');
const { userRouter } = require("./routes/user.routes");
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", userRouter);

app.get("/", (req, res) => {
    res.status(200).send({ msg: "This is Our Homepage." });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB(); // Make sure your DB connection function is properly exported from `./config/db`
        app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to connect to the database", error);
        process.exit(1);
    }
};

startServer();
