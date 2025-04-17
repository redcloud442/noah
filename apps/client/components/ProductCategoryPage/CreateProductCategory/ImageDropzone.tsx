"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  onDropImages: (files: File) => void;
};

export const ImageDropzone = ({ onDropImages }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDropImages(acceptedFiles[0]);
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
      <div
        {...getRootProps()}
        className={`w-52 h-52  border-2 border-dashed rounded-md flex items-center justify-center text-sm text-gray-500 cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : ""
        }`}
      >
        <input {...getInputProps()} />
        <span>Drop or Click</span>
      </div>
    </div>
  );
};
