import { Response } from "express";
import mongoose from "mongoose";
import { Reaction, ReactionEnum } from "../../models/reaction/Reaction";
import User from "../../models/user/User";
import { createErrorResponse, createSuccussResponse } from "../../helpers";
import { RequestWithUserId } from "../../types/types";

export const handlePostReactionsByPostId = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const { postId, reaction } = req.body;

    if (!postId || !reaction) {
      return createErrorResponse(
        res,
        400,
        "POST_ID_OR_REACT_MISSING",
        "Post ID or reaction type is missing."
      );
    }

    // Check if the user has already reacted to the post
    const existingReact = await Reaction.findOne({
      postRef: postId,
      reactBy: new mongoose.Types.ObjectId(req.user?.id),
    });

    if (!existingReact) {
      // If no reaction found, create a new one
      const newReact = new Reaction({
        reaction: reaction,
        postRef: postId,
        reactBy: req.user?.id,
      });
      await newReact.save();

      return createSuccussResponse(
        res,
        200,
        "REACTION_ADDED",
        "Reaction added successfully.",
        newReact
      );
    } else {
      // If reaction is already present, update or remove the reaction
      if (existingReact.reaction === reaction) {
        await Reaction.findByIdAndDelete(existingReact._id);
        return createSuccussResponse(
          res,
          200,
          "REACTION_REMOVED",
          "Reaction removed successfully"
        );
      } else {
        await Reaction.findByIdAndUpdate(existingReact._id, {
          reaction: reaction,
        });
        return createSuccussResponse(
          res,
          200,
          "REACTION_UPDATED",
          "Reaction updated successfully."
        );
      }
    }
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const getReactions = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  ("getReactions");
  try {
    const postId = req.params.id;

    // Fetch all reactions for the post
    const reactsArray = await Reaction.find({ postRef: postId });

    // Initialize reaction counts using ReactionEnum values
    const reactionCounts = Object.values(ReactionEnum).reduce<
      Record<string, number>
    >((counts, reaction) => {
      counts[reaction] = 0;
      return counts;
    }, {});

    // Count reactions
    reactsArray.forEach((reaction) => {
      if (reaction.reaction in reactionCounts) {
        reactionCounts[reaction.reaction] += 1;
      }
    });

    // Prepare the final reactions response
    const reactions = Object.entries(reactionCounts).map(
      ([reaction, count]) => ({
        reaction,
        count,
      })
    );

    // Check if the current user has reacted to this post
    const userReaction = await Reaction.findOne({
      postRef: postId,
      reactBy: req.user?.id,
    });

    // Check if the current user has saved the post
    const user = await User.findById(req.user?.id);
    const isPostSaved = user?.savedPosts.some(
      (savedPost) => savedPost.post.toString() === postId
    );

    // Prepare the response data
    const data = {
      reactions,
      userReaction: userReaction?.reaction,
      totalReacts: reactsArray.length,
      isPostSaved: Boolean(isPostSaved),
    };

    return createSuccussResponse(
      res,
      200,
      "REACTION_DATA",
      "Reactions retrieved successfully.",
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};
