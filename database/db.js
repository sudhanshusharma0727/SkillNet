import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
   try {
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //mongoose gives return object therefore we can hold it in connectionInstance variable  
    console.log(`\n MongoDB connected !! DB HOST: 
      ${connectionInstance.connection.host} `);//pta karne ke liye ki koon se host pe connection ho rha hai
      // console.log(connectionInstance);
      
  } catch (error) {
    console.log("MONGODB connection Failed", error);
    process.exit(1);//read about this in node
  }
    
};

export default connectDB;