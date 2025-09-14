import { inngest } from "../inngest/client.js";

import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Validate authenticated user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Create the ticket
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: {
        id: req.user._id,
        email: req.user.email,
      },
    });

    // Send ticket created event to Inngest
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(), // ✅ removed unnecessary await
        title,
        description,
        createdBy: {
          id: req.user._id.toString(),
          email: req.user.email,
        },
      },
    });

    // Respond with created ticket
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  console.log("👤 Authenticated user in getTickets:", req.user);

  try {
    const user = req.user;
    let tickets = [];

    if (user.role === "admin") {
      // Admin sees all tickets
      tickets = await Ticket.find({}).sort({ createdAt: -1 });
    } else if (user.role === "moderator") {
      console.log("Moderator Email:", user.email);

      // Moderator sees tickets assigned to them or created by them
      tickets = await Ticket.find({
        $or: [
          { assignedTo: user.email },
          { "createdBy.id": user._id }, // ✅ fixed here
        ],
      }).sort({ createdAt: -1 });
    } else {
      // Normal user sees only tickets they created
      tickets = await Ticket.find({ "createdBy.id": user._id })
        .select("title description status createdAt createdBy")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate(
        "createdBy",
        "email"
      );
    } else {
      ticket = await Ticket.findOne({
        _id: req.params.id,
        "createdBy.id": user._id,
      })
        .select(
          "title description status createdAt helpfulNotes relatedSkills priority assignedTo createdBy"
        )
        .populate("createdBy.id", "email");
    }

    console.log(getTicket);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(400).json({ message: "Ticket not found" });
    }

    // if (
    //   req.user.role !== "admin" &&
    //   req.user._id !== ticket.createdBy.toString()
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: "Unauthorized to delete this ticket" });
    // }

    res.status(200).json({
      message: "Ticket deleted successfully",
      deletedTicket: ticket,
    });
  } catch (error) {
    console.error("Error deleting ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
