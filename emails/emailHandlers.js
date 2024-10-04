import { Mailtrap,sender } from "../lib/mailtrap.js"
import { createWelcomeEmailTemplate,createConnectionAcceptedEmailTemplate,createCommentNotificationEmailTemplate } from "./emailTemplates.js"

export const sendWelcomeEmail=async(email,name,profileurl)=>{
  const recipient=[{email}]

  try {
    const response=await Mailtrap.send({
      from:sender,
      to:recipient,
      subject:"Welcome to Linkedin",
      html:createWelcomeEmailTemplate(name,profileurl),
      category:"welcome"
    })

    console.log("Welcome Email sent successfully ",response);
    
  } catch (error) {
    console.log("Error while sending welcome Email: ",error);
    
    throw error;
    
  }

}
export const sendCommentNotificationEmail = async (
	recipientEmail,
	recipientName,
	commenterName,
	postUrl,
	commentContent
) => {
	const recipient = [{ email: recipientEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "New Comment on Your Post",
			html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
			category: "comment_notification",
		});
		console.log("Comment Notification Email sent successfully", response);
	} catch (error) {
		throw error;
	}
};

export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName, profileUrl) => {
	const recipient = [{ email: senderEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: `${recipientName} accepted your connection request`,
			html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
			category: "connection_accepted",
		});
	} catch (error) {}
};