import User from "../models/user.model.js"
import  cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections=async(req,res)=>{

  try {

    const currentUser=await User.findById(req.user._id).select("connections")
     // find users who are not already connected, and also donot recommend our own profile 
     const suggestedUser= await User.find({
      _id:{$ne:currentUser._id,
        $nin:currentUser.connections
      },
     }).select("name username profilePicture headline").limit(3);

     res.json(suggestedUser);
  }

  catch (error) {

    console.log("Error in getSuggestedConnections: ",error.message)

    res.status(500).json({message:"Internal server error"})

  }
}


export const getPublicProfile=async(req,res)=>{

  try {

    const {username}=req.params

    const user=await User.findOne({username}).select("-password  ")

    if(!user)
    {
      return res.status(404).json({message:"User not found"})
    }

    res.json(user);

  }

  catch (error) {

    console.log("Error in getPublicProfile: ",error.message)

    res.status(500).json({message:"Internal server error"})

  }

}

export const updateProfile=async(req,res)=>{

  try {
    const allowedFields=[
      "name",
      "username",
      "headline",
      "location",
      "profilePicture",
      "bannerImg",
      "about",
      "skills",
      "experience",
      "education",
    ];
    const updatedData={};

    for(const field of allowedFields){
      if(req.body[field])
      {
        updatedData[field]=req.body[field]
      } 
    }
    //todo:check for profile and banner Image=> uploaded to cloudinary
    if(req.body.profilePicture)
    {
      const profilePictureUrl=await cloudinary.uploader.upload(req.body.profilePicture)

      updatedData.profilePicture=profilePictureUrl.secure_url
    }
    if(req.body.bannerImg)
    {
      const bannerImgUrl=await cloudinary.uploader.upload(req.body.bannerImg)

      updatedData.bannerImg=bannerImgUrl.secure_url
    }
    const user=await User.findByIdAndUpdate(req.user._id,{
      $set:updatedData
    },{
      new:true
    }).select("-password")

    res.json(user)
    }
  
  catch(error)
  {
    console.log("Error in updatedProfile: ",error.message)
    res.status(500).json({message:"Internal server error"})

  }
}
