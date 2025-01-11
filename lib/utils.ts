import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DOCUMENT_EXTENSIONS, IMAGE_EXTENSIONS, AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from "@/constants"
// Note - all these methods are executed on the client side

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseStringify = (value:unknown) => {
  return JSON.parse(JSON.stringify(value));
}

// type FileType = "document" | "image" | "video" | "audio" | "other";

export const getFileType = (filename : string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if(!extension) return {fileType:"other", extension:""};

  if(DOCUMENT_EXTENSIONS.includes(extension)) return {fileType:"document", extension};
  if(IMAGE_EXTENSIONS.includes(extension)) return {fileType: "image", extension};
  if(VIDEO_EXTENSIONS.includes(extension)) return {fileType: "video", extension};
  if(AUDIO_EXTENSIONS.includes(extension)) return {fileType: "audio", extension};
  return {fileType:"other", extension};
}

export const getFileIcon = (
  extension: string | undefined,
  type: FileType | string,
) => {
  switch (extension) {
    // Document
    case "pdf":
      return "/assets/icons/file-pdf.svg";
    case "doc":
      return "/assets/icons/file-doc.svg";
    case "docx":
      return "/assets/icons/file-docx.svg";
    case "csv":
      return "/assets/icons/file-csv.svg";
    case "txt":
      return "/assets/icons/file-txt.svg";
    case "xls":
    case "xlsx":
      return "/assets/icons/file-document.svg";
    // Image
    case "svg":
      return "/assets/icons/file-image.svg";
    // Video
    case "mkv":
    case "mov":
    case "avi":
    case "wmv":
    case "mp4":
    case "flv":
    case "webm":
    case "m4v":
    case "3gp":
      return "/assets/icons/file-video.svg";
    // Audio
    case "mp3":
    case "mpeg":
    case "wav":
    case "aac":
    case "flac":
    case "ogg":
    case "wma":
    case "m4a":
    case "aiff":
    case "alac":
      return "/assets/icons/file-audio.svg";

    default:
      switch (type) {
        case "image":
          return "/assets/icons/file-image.svg";
        case "document":
          return "/assets/icons/file-document.svg";
        case "video":
          return "/assets/icons/file-video.svg";
        case "audio":
          return "/assets/icons/file-audio.svg";
        default:
          return "/assets/icons/file-other.svg";
      }
  }
};

export const formatDateTime = (isoString :string| null | undefined) => {
  if(!isoString) return "-";

  const date = new Date(isoString);

  // get hours and adjust for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";

  // convert hours to 12 hour format
  hours = hours % 12 || 12;

  // format the time and date parts 
  const time = `${hours}:${minutes.toString().padStart(2, "0")}${period}`;
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  return `${time}, ${day} ${month}`;

};

export const getFileTypesParams = (type: string) => {
  switch (type) {
    case "documents":
      return ["document"];
    case "images":
      return ["image"];
    case "media":
      return ["video", "audio"];
    case "others":
      return ["other"];
    default:
      return ["document", "image", "video", "audio", "other"];
  }
};

export const convertFileSize = (sizeInBytes:number, digits?:number) => {
  if(sizeInBytes<1024){
      // less than 1Kb, show in bytes
      return sizeInBytes + " Bytes";
  } else if (sizeInBytes < 1024 * 1024){
      // less than 1 Mb, show in bytes
      const sizeInKB = sizeInBytes / 1024;
      return sizeInKB.toFixed(digits || 1) + " KB";
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
      const sizeInMB = sizeInBytes / (1024 * 1024);
      return sizeInMB.toFixed(digits || 1) + " MB"; // Less than 1 GB, show in MB
  } else {
      const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
      return sizeInGB.toFixed(digits || 1) + " GB"; // 1 GB or more, show in GB
  }
}

export const convertFileToURL = (file:File) => {
  return URL.createObjectURL(file);
}

export const constructFileURL = (bucketFileId:string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
}

export const constructDownloadURL = (bucketFileId:string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
}

export const getUsageSummary = (totalSpace:any) => {
  return [
    {
      title:"Documents",
      size: totalSpace.document.size,
      latestDate: totalSpace.document.latestDate,
      icon: "/assets/icons/file-document-light.svg",
      url: "/documents",
    },
    {
      title: "Images",
      size: totalSpace.image.size,
      latestDate: totalSpace.image.latestDate,
      icon: "/assets/icons/file-image-light.svg",
      url: "/images",
    },
    {
      title: "Media",
      size: totalSpace.video.size + totalSpace.audio.size,
      latestDate:
        totalSpace.video.latestDate > totalSpace.audio.latestDate
          ? totalSpace.video.latestDate
          : totalSpace.audio.latestDate,
      icon: "/assets/icons/file-video-light.svg",
      url: "/media",
    },
    {
      title: "Others",
      size: totalSpace.other.size,
      latestDate: totalSpace.other.latestDate,
      icon: "/assets/icons/file-other-light.svg",
      url: "/others",
    },
  ];
};

export const calculatePercentage = (sizeInBytes: number) => {
  const totalSizeInBytes = 2 * 1024 * 1024 * 1024;
  const percentage = (sizeInBytes /totalSizeInBytes);
  return Number(percentage.toFixed(2));
}