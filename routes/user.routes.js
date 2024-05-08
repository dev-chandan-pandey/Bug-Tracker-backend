// const express = require("express");
// const bcrypt = require("bcrypt");
// require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const { UserModel } = require("../models/UserModel");
// const { BugModel } = require("../models/bugModel");
// const { auth } = require("../middlewares/auth.middleware");
// const { blacklist } = require("../models/blacklist");
// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const userRouter = express.Router();

// userRouter.get("/", async (req, res) => {
//   try {
//     const users = await UserModel.find();
//     res.status(200).send({ msg: "List of All the Users.", users });
//   } catch (error) {
//     res.status(500).send({ Error: error });
//   }
// });

// // Multer configurationb
// const storage = multer.diskStorage({});
// const upload = multer({ storage });

// // Cloudinary configuration
// // import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.cloud_name,
//   api_key: process.env.api_key,
//   api_secret: process.env.api_secret,
// });

// // Route to handle user registration with file upload
// userRouter.post("/register", upload.single("avatar"), async (req, res) => {
//   const { name, email, password } = req.body;
//   const created_at = new Date();

//   try {
//     const user = await UserModel.findOne({ email });

//     if (user) {
//       return res.status(409).send({ msg: "User already registered." });
//     }

//     let avatarUrl = "";

//     if (req.file) {
//       // Upload avatar to Cloudinary
//        avatarUrl = req.file ? (await cloudinary.uploader.upload(req.file.path)).secure_url : "";
//       //const result = await cloudinary.uploader.upload(req.file.path);
//      // avatarUrl = result.secure_url;
//     }

//     bcrypt.hash(password, 10, async (err, hash) => {
//       if (err) {
//         return res.status(500).send({ Error: err.message });
//       }

//       const newUser = new UserModel({
//         name,
//         email,
//         password: hash,
//         avatar: avatarUrl,
//         created_at,
//       });

//       await newUser.save();
//       res.status(200).send({ msg: "New user registered successfully." });
//     });
//   } catch (error) {
//     res.status(500).send({ Error: error.message });
//   }
// });

// // login route
// userRouter.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await UserModel.findOne({ email });
//     if (user) {
//       bcrypt.compare(password, user.password, (err, result) => {
//         if (err) {
//           res.status(500).send({ Error: err });
//         } else if (result) {
//           const token = jwt.sign({ userID: user._id }, "chandan", {
//             expiresIn: "1d",
//           });

//           res
//             .status(200)
//             .send({ msg: "User Logged in Successfully.", token, user });
//         }
//       });
//     }
//   } catch (error) {
//     res.status(500).send({ Error: error });
//   }
// });
// // logout
// userRouter.get("/logout", (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   blacklist.push(token);
//   res.status(200).send({ msg: "Logout successsful" });
// });

// module.exports = { userRouter };

// // get all bugs for the user
// userRouter.get("/bugs", auth, async (req, res) => {
//   try {
//     const bugs = await BugModel.find({ raised_by: req.body.userID });
//     console.log(req.body.userID);
//     res.status(200).send({ msg: "List of All the Bugs.", bugs });
//   } catch (error) {
//     res.status(500).send({ Error: error });
//   }
// });

// // post bug
// userRouter.post("/bugs", auth, async (req, res) => {
//   const { title, description, source, severity } = req.body;
//   try {
//     const newBug = new BugModel({
//       title,
//       description,
//       source,
//       severity,
//       raised_by: req.body.userID,
//     });
//     await newBug.save();
//     res.status(200).send({ msg: "New Bug Added Successfully.", newBug });
//   } catch (error) {
//     res.status(500).send({ Error: error });
//   }
// });

// // find bug by id
// userRouter.get("/bugs/:id", auth, async (req, res) => {
//   try {
//     const bugId = req.params.id;
//     const bug = await BugModel.findById(bugId);
//     if (!bug) {
//       return res.status(404).send({ error: "Bug not found." });
//     }

//     res.status(200).send({ msg: "Bug found successfully.", bug });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });
// // find bug by id and update
// userRouter.patch("/bugs/:id", auth, async (req, res) => {
//   const { id } = req.params;

//   try {
//     await BugModel.findByIdAndUpdate({ _id: id }, req.body);
//     res.status(200).send({ msg: "Bug updated successfully." });
//   } catch (error) {
//     res.status(500).send({ msg: "Error updating Note", error: error });
//   }
// });
// // find bug by id and delete
// userRouter.delete("/bugs/:id", auth, async (req, res) => {
//   const { id } = req.params;

//   try {
//     await BugModel.findByIdAndDelete({ _id: id });
//     res.status(200).send({ msg: "Bug Deleted successfully." });
//   } catch (error) {
//     res.status(500).send({ msg: "Error updating Note", error: error });
//   }
// });

// module.exports = { userRouter };
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { UserModel } = require("../models/UserModel");
const { BugModel } = require("../models/BugModel");
const { auth } = require("../middlewares/auth.middleware");
const userRouter = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = multer.diskStorage({});
const upload = multer({ storage });

userRouter.post("/register", upload.single("avatar"), async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (await UserModel.findOne({ email })) {
            return res.status(409).json({ msg: "User already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const avatarUrl = req.file ? (await cloudinary.uploader.upload(req.file.path)).secure_url : "";

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            avatar: avatarUrl,
            created_at: new Date()
        });

        await newUser.save();
        res.status(201).json({ msg: "User registered successfully!" });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ msg: "Error registering new user", error: error.message });
    }
});

// Additional routes (login, logout, bug tracking) should follow the same pattern

module.exports = { userRouter };
