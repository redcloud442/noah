"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  previewUrls: string[];
  onDropImages: (files: File[]) => void;
};

export const VariantImageEditDropzone = ({
  previewUrls,
  onDropImages,
}: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDropImages(acceptedFiles);
    },
    [onDropImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-2 items-center">
      {previewUrls.length === 0 && (
        <div
          {...getRootProps()}
          className={`w-52 h-52  border-2 border-dashed rounded-md flex items-center justify-center text-sm text-gray-500 cursor-pointer ${
            isDragActive ? "border-blue-500 bg-blue-50" : ""
          }`}
        >
          <input {...getInputProps()} />
          <span>Drop or Click</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-start">
        {previewUrls.map((url, index) => (
          <Image
            key={index}
            src={url}
            alt={`Preview ${index + 1}`}
            width={200}
            height={200}
            className="object-cover rounded border"
          />
        ))}
      </div>
    </div>
  );
};
