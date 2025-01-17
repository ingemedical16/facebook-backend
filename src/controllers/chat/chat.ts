import { Request, Response } from "express";
import { Types } from "mongoose";
import { createErrorResponse, createSuccussResponse, emitSocketEvent } from "@/helpers";
import Chat from "@/models/chat/Chat";
import User from "@/models/user/User";
import { RequestWithUserId, ResponseData } from "@/types/types";

export const createPrivateChat = async (
  req: RequestWithUserId<{}, ResponseData, { recipientId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return createErrorResponse(
        res,
        400,
        "INVALID_INPUT",
        "Recipient ID is required."
      );
    }

    const senderId = req.user?.id;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "The recipient does not exist."
      );
    }

    let chat = await Chat.findOne({
      type: "private",
      members: { $all: [senderId, recipientId] },
    });

    if (chat) {
      return createSuccussResponse(
        res,
        200,
        "CHAT_EXISTS",
        "Private chat already exists.",
        chat
      );
    }

    chat = await Chat.create({
      type: "private",
      owner: senderId,
      members: [senderId, recipientId],
      messages: [],
    });
    if(req.io){
      emitSocketEvent({
      io: req.io, 
      event: "chat_created", 
      roomId:senderId!, 
      data: chat
    });
    }
    

    return createSuccussResponse(
      res,
      201,
      "CHAT_CREATED",
      "Private chat created successfully.",
      chat
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const sendMessage = async (
  req: RequestWithUserId<{ chatId: string }, {}, { content: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content) {
      return createErrorResponse(
        res,
        400,
        "INVALID_INPUT",
        "Message content is required."
      );
    }

    const senderId = new Types.ObjectId(req.user?.id);

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return createErrorResponse(
        res,
        404,
        "CHAT_NOT_FOUND",
        "The specified chat does not exist."
      );
    }

    if (!chat.members.includes(senderId)) {
      return createErrorResponse(
        res,
        403,
        "FORBIDDEN",
        "You are not a member of this chat."
      );
    }

    const message = { sender: senderId, content, timestamp: new Date() };
    chat.messages.push(message);
    await chat.save();
      if(req.io){
        emitSocketEvent({
        io: req.io, 
        event: "message_sent", 
        roomId: chatId, 
        data: message
      }
    );
  }
    return createSuccussResponse(
      res,
      200,
      "MESSAGE_SENT",
      "Message sent successfully.",
      message
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const addMemberToChat = async (
  req: RequestWithUserId<
    { chatId: string },
    ResponseData,
    { memberId: string }
  >,
  res: Response
): Promise<Response> => {
  try {
    const { chatId } = req.params;
    const { memberId } = req.body;
    const member_id = new Types.ObjectId(memberId);

    if (!memberId) {
      return createErrorResponse(
        res,
        400,
        "INVALID_INPUT",
        "Member ID is required."
      );
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return createErrorResponse(
        res,
        404,
        "CHAT_NOT_FOUND",
        "The specified chat does not exist."
      );
    }

    const userId = req.user?.id;

    if (chat.owner.toString() !== userId) {
      return createErrorResponse(
        res,
        403,
        "FORBIDDEN",
        "Only the owner can add members to this chat."
      );
    }

    if (chat.members.includes(member_id)) {
      return createErrorResponse(
        res,
        400,
        "MEMBER_EXISTS",
        "The user is already a member of this chat."
      );
    }

    chat.members.push(member_id);
    chat.type = "group";
    await chat.save();
    if(req.io){
      emitSocketEvent({
        io: req.io, 
        event: "member_added", 
        roomId: chatId, 
        data: chat
      });
    };

    return createSuccussResponse(
      res,
      200,
      "MEMBER_ADDED",
      "Member added successfully.",
      chat
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const removeMemberFromChat = async (
  req: RequestWithUserId<{ chatId: string }, {}, { memberId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { chatId } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return createErrorResponse(
        res,
        400,
        "INVALID_INPUT",
        "Member ID is required."
      );
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return createErrorResponse(
        res,
        404,
        "CHAT_NOT_FOUND",
        "The specified chat does not exist."
      );
    }

    const userId = req.user?.id;

    if (chat.owner.toString() !== userId) {
      return createErrorResponse(
        res,
        403,
        "FORBIDDEN",
        "Only the owner can remove members from this chat."
      );
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== memberId
    );
    await chat.save();
    if(req.io){
      emitSocketEvent({
        io: req.io, 
        event: "member_removed", 
        roomId: chatId, 
        data: chat
      });
    };

    return createSuccussResponse(
      res,
      200,
      "MEMBER_REMOVED",
      "Member removed successfully.",
      chat
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const getChatDetails = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).populate("members", "name email");
    if (!chat) {
      return createErrorResponse(
        res,
        404,
        "CHAT_NOT_FOUND",
        "The specified chat does not exist."
      );
    }

    return createSuccussResponse(
      res,
      200,
      "CHAT_DETAILS",
      "Chat details successfully retrieved",
      chat
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};
