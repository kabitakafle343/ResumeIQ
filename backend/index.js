const express=require("express");
const cookie=require("cookie-parser")
const cors=require("cors")
require("dotenv").config()
const pdfUpload=require("./controller/upload")
const app=express()
const dbConnect=require("./config/db")
const userAuth=require("./routes/userRoutes")
const resumeHistory=require("./routes/history")
const allowedOrigins=(process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((origin)=>origin.trim())

app.use(cors({
    origin:(origin,callback)=>{
        if(!origin || allowedOrigins.includes(origin)){
            return callback(null,true)
        }
        return callback(new Error("Origin is not allowed by CORS"))
    },
    credentials:true,
}))
app.use(express.json())
app.use(cookie())
app.use("/api/pdf", pdfUpload);
app.use("/api/resume",resumeHistory)
app.use("/api/auth",userAuth)
 dbConnect()
app.listen(process.env.PORT,()=>{
    console.log("server is running in the port",process.env.PORT)
   
})