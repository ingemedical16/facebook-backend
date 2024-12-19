import mongoose, { Schema, Document, Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

export enum ReactionEnum {
    like = "like",
    love = "love",
    haha = "haha",
    sad = "sad",
    angry = "angry",
    wow = "wow",
}

// Define the interface for a reaction
export interface ReactionDocument extends Document {
  reaction: ReactionEnum;
  postRef?: mongoose.Types.ObjectId;
  reactBy?: mongoose.Types.ObjectId;
}

// Create the reaction schema
const reactionSchema = new Schema<ReactionDocument>({
  reaction: {
    type: String,
    enum: ["like", "love", "haha", "sad", "angry", "wow"],
    required: true,
  },
  postRef: {
    type: ObjectId,
    ref: "Post",
  },
  reactBy: {
    type: ObjectId,
    ref: "User",
  },
});

// Export the model
export const Reaction: Model<ReactionDocument> =
  mongoose.model<ReactionDocument>("Reaction", reactionSchema);
