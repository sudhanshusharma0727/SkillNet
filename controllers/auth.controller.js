import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt  from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup=async(req,res)=>{
  try {
      const {name,username,email,password}=req.body;
      if(!name|| !username||!email||!password)
      {
        return res.status(400).json({message:"Please fill all the fields"})
      }
      const existingEmail=await User.findOne({email})
      const existingUsername=await User.findOne({username})
      if(existingEmail || existingUsername){
        return res.status(400).json({message:"User already exists"})
      }
      if(password.length<6)
      {
        return res.status(400).json({message:"Password must be at least 6 characters"})
      }
      const salt=await bcrypt.genSalt(10)
      const hashedPassword=await bcrypt.hash(password,salt)
      const user=new User({
        name,
        username,
        email,
        password:hashedPassword
      })
      await user.save()

      const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
        expiresIn:"3d"
      })
      res.cookie("jwt-linkedin",token,{
        httpOnly:true,// prevent XSS attack
        maxAge:3*24*60*60*1000,
        sameSite:"strict",//prevent CSRF attack
        secure:true
      })
      res.status(201).json({message:"User registered successfully"})

      //todo: send welcome email
      const profileUrl=process.env.CLIENT_URL + "/profile/"+ user.username
      try {
        await sendWelcomeEmail(user.email,user.name,profileUrl)
      } catch (error) {
        console.log("Error sending email: ",error.message);
  
      }

  } catch (error) {
    console.log("Error in signup: ",error.message)
    res.status(500).json({message:"Internal server error"})
    
  }
}

export const login=async(req,res)=>{
  try {
    const {username,password}=req.body;

    //check if user exists
    const user=await User.findOne({username});
    if(!user){
      return res.status(400).json({message:"User not found"})
    }

    //check if password is correct
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
      return res.status(400).json({message:"Invalid credentials"})
    }

    //create and send token
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
      expiresIn:"3d"
    })
    res.cookie("jwt-linkedin",token,{
      httpOnly:true,// prevent XSS attack
      maxAge:3*24*60*60*1000,
      sameSite:"strict",//prevent CSRF attack
      secure:true
    })
    res.status(200).json({message:"Logged in successfully"})

  } catch (error) {
    console.log("Error in login: ",error.message)
    res.status(500).json({message:"Internal server error"})
  }
  
}

export const logout=(req,res)=>{
  res.clearCookie("jwt-linkedin");
  res.status(200).json({message:"Logged out successfully"})
}

export const getCurrentUser=async(req,res)=>{
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in getCurrentUser: ",error.message)
    res.status(500).json({message:"Internal server error"})
    
  }
}
