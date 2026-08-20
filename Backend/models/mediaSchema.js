import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    url: { type: String }, // add required after getting images successfully
    publicId: { type: String }

}, { _id: false });

export default mediaSchema;