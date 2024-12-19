import mongoose, { Schema, Document, Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

// Define the interface for a comment
interface Comment {
  comment?: string;
  image?: string;
  commentBy?: mongoose.Types.ObjectId;
  commentAt: Date;
}

// Define the interface for a post
export interface PostDocument extends Document {
  type: "profilePicture" | "coverPicture" | null;
  text?: string;
  images?: string[];
  user: mongoose.Types.ObjectId;
  background?: string;
  comments: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the post schema
const postSchema = new Schema<PostDocument>(
  {
    type: {
      type: String,
      enum: ["profilePicture", "coverPicture", null],
      default: null,
    },
    text: {
      type: String,
    },
    images: {
      type: [String], // Explicitly define as an array of strings
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    background: {
      type: String,
    },
    comments: [
      {
        comment: {
          type: String,
        },
        image: {
          type: String,
        },
        commentBy: {
          type: ObjectId,
          ref: "User",
        },
        commentAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Export the model
export const Post: Model<PostDocument> = mongoose.model<PostDocument>(
  "Post",
  postSchema
);
