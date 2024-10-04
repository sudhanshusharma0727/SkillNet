import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  name:{type:String,required:true},
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  profilePicture:{
    type:String,
    default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },
  bannerImg:{
    type:String,
    default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  },
  headline:{
    type:String,
    default:"Linkedin User"
  },
  location:{
    type:String,
    default:""
  },
  about:{
    type:String,
    default:""
  },
  skills:[String],
  experience:{
    type:String,
    company:String,
    startDate:Date,
    endDate:Date,
    description:String
  },
  education:[
    {
      school:String,
      fieldOfStudy:String,
      startYear:Number,
      endYear:Number
    }
  ],
  connections:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  ]


},{timestamps:true})

const User=mongoose.model("User",userSchema)

export default User;