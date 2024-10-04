import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
export const getFeedPosts=async(req,res)=>{
  try {
    const posts=await Post.find({author:{$in:req.user.connections}})
    .populate(
      "author",
      "name username profilePicture headline")
    .populate("comments.user","name profilePicture")
    .sort({createdAt:-1});

    res.status(200).json(posts);
    
  } catch (error) {
    console.log("Error in getFeedPosts: ",error.message)
    res.status(500).json({message:"Internal server error"})
    
  }
}

export const createPost=async(req,res)=>{
  try {
    const {content,image}=req.body;

    let newPost;

    if(image){
      const imgResult=await cloudinary.uploader.upload(image)

      newPost=await Post.create({
        content,
        image:imgResult.secure_url,
        author:req.user._id
      })

    }
    else{
      newPost=await Post.create({
        content,
        author:req.user._id
      })
    }
    await newPost.save()
    res.status(201).json({message:"Post created successfully"})
    
  } catch (error) {
    
  }
}

export const deletePost=async(req,res)=>{
  try {
    const postId=req.params.id;
    const userId=req.user._id;

    const post=await Post.findById(postId)
    if(!post){
      return res.status(404).json({message:"Post not found"})
    }

    if(post.author.toString()!==userId.toString()){
      return res.status(401).json({message:"Unauthorized"})
    }
    //Todo: delete image from cloudinary 
    if(post.image)
    {
      await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
    }

    await Post.findByIdAndDelete(postId)

    res.status(200).json({message:"Post deleted successfully"})
  } 
  catch (error) {
    console.log("Error in deletePost: ",error.message)
    res.status(500).json({message:"Internal server error"})
  }
}

export const getPostById=async(req,res)=>{
  try {
    const postId=req.params.id;
    const post=await Post.findById(postId)
    .populate("author","name username profilePicture headline")
    .populate("comments.user", "name profilePicture username headline");;
    res.status(200).json(post);
    
  } catch (error) {
    console.log("Error in getPostById: ",error.message)
    res.status(500).json({message:"Internal server error"})
    
  }
}

export const createComment=async(req,res)=>{
  try {
    const postId=req.params.id;
    const {content}=req.body;

    const post=await Post.findByIdAndUpdate(postId,{
      $push:{
        comments:{
          content,
          user:req.user._id
        }
      }
      },{
        new:true
      }
    ).populate("author","name email username profilePicture headline");

    // create notification if comment is created by other user
    if(post.author._id.toString()!==req.user._id.toString()){
      const newNotification= new Notification({
        recipient:post.author._id,
        type:"comment",
        relatedUser:req.user._id,
        relatedPost:postId
      })

      await newNotification.save();
      //todo:send email
      try {
        const postUrl=process.env.CLIENT_URL+"/post/"+postId
        await sendCommentNotificationEmail(post.author.email,post.author.name,req.user.name,postUrl,content)
        
      } catch (error) {
        console.log("Error in sendCommentNotificationEmail: ",error.message)
      }
      }
    

    res.status(201).json({message:"Comment created successfully"})


  } catch (error) {
    console.log("Error in createComment: ",error.message)
    res.status(500).json({message:"Internal server error"})
    
  }
}

export const likePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);
		const userId = req.user._id;

		if (post.likes.includes(userId)) {
			// unlike the post
			post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
		} else {
			// like the post
			post.likes.push(userId);
			// create a notification if the post owner is not the user who liked
			if (post.author.toString() !== userId.toString()) {
				const newNotification = new Notification({
					recipient: post.author,
					type: "like",
					relatedUser: userId,
					relatedPost: postId,
				});

				await newNotification.save();
			}
		}

		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.error("Error in likePost controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};