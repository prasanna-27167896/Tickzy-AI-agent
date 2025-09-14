import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    link:{
        type: String,
        required:true,
    },
    recieverEmail:{
        type: String,
        required:true,
        unique:true
    },
    message:{
        type: String,
        required:false,
        unique:false
    }
});

export default mongoose.model("Video",videoSchema);