import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import User  from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import Ticket from "../../models/ticket.js"



export const onSendInvite = inngest.createFunction(
  {
    id: "on-send-invite",
    retries: 2,
  },
  { event: "video/invite" },
  async ({ event, step }) => {
    try {
      const { link, recieverEmail, message,id } = event.data;

      const userObj = await step.run("find-user", async () => {
        const user = await User.findOne({ email: recieverEmail });
        if (!user) {
          throw new NonRetriableError("User doesn't exist in our database");
        }
        return user;
      });

      const ticketDetails=await step.run("find-ticket", async ()=>{
        const ticket = await Ticket.findOne({_id:id})

        if(!ticket){
          throw new NonRetriableError("Ticket doesn't exist in our database");
        }

        return ticket
      })

      console.log(ticketDetails);

      let senderEmail=ticketDetails.assignedTo;

      const senderDetails= await step.run("find-sender-details",async()=>{
        const email= await User.findOne({email:senderEmail});
        
         if (!email) {
          throw new NonRetriableError("User doesn't exist in our database");
        }
        return email;
      })

      console.log(senderDetails);
      
      

      await step.run("send-invite-email", async () => {
        const subject = "You're Invited to an Online Meeting";
        const body = `
Hi ${userObj.username || "there"},

Title: ${ticketDetails.title}

You've been invited to join a meeting. Click below to join:
${link}

${message ? `Message from sender: ${message}` : ""}

Regards,  
${senderDetails.username}
${senderDetails.email}
Ticky AI Team
        `;

        return sendMail(recieverEmail, subject, body);
      });

      console.log("✅ Invite email sent");
      return { success: true };
    } catch (error) {
      console.error("❌ Send invite error:", error);
      throw error;
    }
  }
);
