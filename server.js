import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import connectionRoutes from "./routes/connection.route.js";
import connectDB from "./database/db.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app=express();
const PORT=process.env.PORT || 5000;

app.use(express.json());//parse the JSON request body 
app.use(cookieParser());

connectDB()//connectDB(): This function attempts to connect to the MongoDB database. It returns a promise, so .then() and .catch() are used to handle success and failure, respectively.
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running at port:${process.env.PORT}`);
    
  })
})
.catch((err) => console.log("MONGO DB CONNECTION FAILED!!",err));

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/posts",postRoutes)
app.use("/api/v1/notifications",notificationRoutes)
app.use("/api/v1/connections", connectionRoutes);