import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  {
    id: "on-user-signup",
    retries: 2,
  },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      //to find user in db

      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });

        if (!userObject) {
          throw new NonRetriableError("User doesn't exist in our database"); //this error from inngest
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `
        Hi,
        \n\n
        Thanks for signing up. We're glad to have you onboard!
        \n\n
        Best regards,  
        Prasanna Kumar V
        `;

        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false };
    }
  }
);
