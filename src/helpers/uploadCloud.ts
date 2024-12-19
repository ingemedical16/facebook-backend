import { v2 as cloudinary, UploadApiResponse  } from "cloudinary";
import { File } from "formidable";
import dotenv from "dotenv";
import { SearchApiResponse } from "@/types/types";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME as string,
  api_key: process.env.CLOUD_KEY as string,
  api_secret: process.env.CLOUD_SECRET as string,
  secure: true,
});

export const uploadsFilesToCloud = async (files: File | File[], folder: string) => {
  if (Array.isArray(files)) {
    let uploadsResponse: UploadApiResponse[] = [];
    const imagesToUpload = files.map((file: File) => {
      return async () => {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: folder,
        });
        uploadsResponse = [...uploadsResponse, result];
      };
    });

    let uploads = await Promise.all(imagesToUpload);
    for (let i = 0; uploads[i]; i++) {
      await uploads[i]();
    }

    return uploadsResponse;
  } else {
    const result = await cloudinary.uploader.upload(files.filepath, {
      folder: folder,
    });
    return [result];
  }
};

export const searchImages = async (
  path: string,
  sort: "asc" | "desc",
  max: number
): Promise<SearchApiResponse> => {
  const result = await cloudinary.search
    .expression(path)
    .sort_by("created_at", sort)
    .max_results(max)
    .execute();
  return result;
};
