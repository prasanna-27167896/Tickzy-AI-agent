import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import { NonRetriableError } from "inngest";
import User from "../../models/user.js";
import analyzeTicket from "../../utils/ai-agent.js";
import { sendMail } from "../../utils/mailer.js";

export const onTicketCreated = inngest.createFunction(
  {
    id: "on-ticket-created",
    retries: 2,
  },
  { event: "ticket/created" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // 1. Fetch ticket
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // 2. Set status to TODO
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      // 3. Analyze with AI
      const aiResponse = await analyzeTicket(ticket);

      // 4. Save AI-generated fields
      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];

        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }

        return skills;
      });

      // 5. Assign moderator
      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $in: relatedSkills.map((skill) => new RegExp(skill, "i")),
          },
        });

        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user ? user.email : null,
        });

        return user;
      });

      // 6. Send email notification
      await step.run("send-email-notification", async () => {
        try {
          if (moderator?.email) {
            const finalTicket = await Ticket.findById(ticket._id);

            if (!finalTicket) {
              throw new NonRetriableError("Final ticket not found");
            }

            await sendMail(
              moderator.email,
              "Ticket Assigned",
              `A new ticket is assigned to you.\n\nTitle: ${finalTicket.title}`
            );
          }
        } catch (err) {
          console.error("❌ Failed to send email:", err.message);
          throw new NonRetriableError("Email error: " + err.message);
        }
      });

      return { success: true };
    } catch (error) {
      console.error(
        "❌ Error running the on-ticket-created function:",
        error.message
      );
      return { success: false };
    }
  }
);
