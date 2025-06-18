"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  onDropImages: (file: File) => void;
  previewUrl?: string;
};

export const ImageDropzone = ({ onDropImages, previewUrl }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDropImages(acceptedFiles[0]); // Use the first file only
      }
    },
    [onDropImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="flex flex-col gap-2 items-center">
      {previewUrl ? (
        <div className="w-52 h-52">
          <Image
            src={previewUrl}
            alt="Preview"
            width={208}
            height={208}
            className="rounded-md object-cover"
          />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-52 h-52 border-2 border-dashed rounded-md flex items-center justify-center text-sm text-gray-500 cursor-pointer ${
            isDragActive ? "border-blue-500 bg-blue-50" : ""
          }`}
        >
          <input {...getInputProps()} />
          <span>Drop or Click</span>
        </div>
      )}
    </div>
  );
};
