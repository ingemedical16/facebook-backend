import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  picture?: string;
  cover?: string;
  gender: "male" | "female" | "other";
  birth_year: number;
  birth_month: number;
  birth_day: number;
  verified?: boolean;
  friends: string[];
  following: string[];
  followers: string[];
  requests: string[];
  search: mongoose.Types.ObjectId[];
  details: {
    biography?: string;
    otherName?: string;
    job?: string;
    workPlace?: string;
    highSchool?: string;
    college?: string;
    currentCity?: string;
    homeTown?: string;
    relationShip?: "single" | "married" | "divorced" | "widowed" | "other";
    instagram?: string;
  };
  savedPosts: {
    post: mongoose.Types.ObjectId;
    savedAt?: Date;
  }[];
}

const userSchema: Schema<IUser> = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      validate: {
        validator: (value: string) => {
          const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dxos5na7j/image/upload/v1731177858/assets/images/hno2u07pzd3xh3pu5z3b.png",
    },
    cover: {
      type: String,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    birth_year: {
      type: Number,
      required: [true, "Year of birth is required"],
    },
    birth_month: {
      type: Number,
      required: [true, "Month of birth is required"],
    },
    birth_day: {
      type: Number,
      required: [true, "Day of birth is required"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    followers: {
      type: [String],
      default: [],
    },
    requests: {
      type: [String],
      default: [],
    },
    search: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    details: {
      biography: {
        type: String,
        trim: true,
      },
      otherName: {
        type: String,
        trim: true,
      },
      job: {
        type: String,
        trim: true,
      },
      workPlace: {
        type: String,
        trim: true,
      },
      highSchool: {
        type: String,
        trim: true,
      },
      college: {
        type: String,
        trim: true,
      },
      currentCity: {
        type: String,
        trim: true,
      },
      homeTown: {
        type: String,
        trim: true,
      },
      relationShip: {
        type: String,
        enum: ["single", "married", "divorced", "widowed", "other"],
      },
      instagram: {
        type: String,
      },
    },
    savedPosts: [
      {
        post: {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create a single compound text index for searchable fields
userSchema.index(
  {
    first_name: "text",
    last_name: "text",
    username: "text",
    "details.biography": "text",
    "details.otherName": "text",
    "details.job": "text",
    "details.workPlace": "text",
    "details.highSchool": "text",
    "details.college": "text",
    "details.currentCity": "text",
    "details.homeTown": "text",
  },
  { name: "UserTextIndex" }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
