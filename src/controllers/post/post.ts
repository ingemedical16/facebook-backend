import { Request, Response } from "express";
import { Post } from "../../models/post/Post";
import User from "../../models/user/User";
import { createErrorResponse, createSuccussResponse } from "../../helpers";
import { RequestWithUserId } from "@/types/types";
import mongoose from "mongoose";

export const createPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { type, background, text, images, user,isProfile } = req.body;

    // Validate required fields
    if (!user) {
      return createErrorResponse(
        res,
        400,
        "MISSING_REQUIRED_FIELDS",
        "User ID is required."
      );
    }

    if (!mongoose.isValidObjectId(user)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_USER",
        "Invalid user ID provided."
      );
    }

    // Validate optional fields
    if (type && !["profilePicture", "coverPicture", null].includes(type)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_TYPE",
        "Type must be 'profilePicture', 'coverPicture', or null."
      );
    }

    if (images && !Array.isArray(images)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_IMAGES",
        "Images must be an array of strings."
      );
    }

    // Construct the post object
    const postData = {
      type: type || null, 
      background,
      text,
      images: images || [], // Default to an empty array
      user,
    };

    // Create and save the post
    const post = await new Post(postData).save();

    // Populate user details
    await post.populate("user", "first_name last_name cover picture username");

    // Send success response
    return createSuccussResponse(
      res,
      200,
      "POST_CREATED",
      "Post created successfully.",
      {post, isProfile:isProfile as boolean}
    );
  } catch (error: unknown) {
    console.error("Error creating post:", error);

    const errorMessage =
      (error as Error).message || "An unexpected error occurred.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const getAllPosts = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        400,
        "USER_ID_MISSING",
        "User ID is missing in the request."
      );
    }

    // Fetch the list of users the current user is following
    const followingTemp = await User.findById(userId).select("following");
    if (!followingTemp) {
      return createErrorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
    }

    const following = followingTemp.following;

    // Fetch posts from users the current user is following
    const promises = following.map((userId) =>
      Post.find({ user: userId })
        .populate("user", "first_name last_name picture username cover")
        .populate("comments.commentBy", "first_name last_name picture username")
        .sort({ createdAt: -1 })
        .limit(10)
    );

    const followingPosts = await Promise.all(promises).then((posts) =>
      posts.flat()
    );

    // Fetch the current user's own posts
    const userPosts = await Post.find({ user: userId })
      .populate("user", "first_name last_name picture username cover gender")
      .populate("comments.commentBy", "first_name last_name picture username")
      .sort({ createdAt: -1 })
      .limit(10);

    // Merge the user's posts with the following posts
    const allPosts = [...followingPosts, ...userPosts];

    // Sort all posts by creation date
    allPosts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) {
        throw new Error("Missing createdAt property in a post");
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    const data = {
      posts: allPosts,
    };

    // Respond with the sorted posts
    return createSuccussResponse(
      res,
      200,
      "POSTS_FETCHED",
      "Posts fetched successfully.",
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const comment = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const { comment, image, postId } = req.body;
    if (!comment || !postId) {
      return createErrorResponse(
        res,
        400,
        "COMMENT_OR_POST_ID_MISSING",
        "Comment or post ID is missing."
      );
    }

    // Add the comment to the post
    const newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user?.id,
            commentAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("comments.commentBy", "picture first_name last_name username");

    if (!newComments) {
      return createErrorResponse(res, 404, "POST_NOT_FOUND", "Post not found.");
    }
    const data = {
      comments: newComments.comments,
      postId
    };
    return createSuccussResponse(
      res,
      200,
      "COMMENT_ADDED",
      "Comment added successfully.",
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const savePost = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return createErrorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
    }

    // Check if the post is already saved
    const existingSavedPost = user.savedPosts.find(
      (post) => post.post.toString() === postId
    );

    if (existingSavedPost) {
      // Remove from saved posts if already saved
      await User.findByIdAndUpdate(req.user?.id, {
        $pull: { savedPosts: { postId: existingSavedPost?.post } },
      });
      return createSuccussResponse(
        res,
        200,
        "POST_REMOVED_FROM_SAVED",
        "Post removed from saved list."
      );
    } else {
      // Add to saved posts
      await User.findByIdAndUpdate(req.user?.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
      return createSuccussResponse(
        res,
        200,
        "POST_SAVED",
        "Post saved successfully."
      );
    }
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const postId = req.params.id;

    // Attempt to remove the post from the database
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return createErrorResponse(res, 404, "POST_NOT_FOUND", "Post not found.");
    }
    return createSuccussResponse(
      res,
      200,
      "POST_DELETED",
      "Post deleted successfully"
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};
