
import { inngest } from "../inngest/client.js";
import Video from "../models/video.js"


export const invite=async (req,res)=>{
    try {
        const {link,recieverEmail,message="",id}=req.body;
        console.log(req.body);
        

        if(!link && !recieverEmail){
            return res.status(400).json({Error:"link and email required"})
        }

        const video=await Video.create({
            link,
            recieverEmail,
            message
        })

        await inngest.send({
            name:"video/invite",
            data:{
                link,
                recieverEmail,
                message,
                id
            }
        })

        console.log("✅ Event sent to Inngest:", recieverEmail);
         res.status(200).json({ success: true });
    } catch (error) {
       console.error("Invite Controller failed:",error);
       res.status(500).json({ error: "Invite Controller failed", details: error.message });
    }
}