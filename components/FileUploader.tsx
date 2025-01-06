"use client"
import { cn, getFileType, convertFileToURL } from "@/lib/utils";
import { useCallback, useState } from "react"
import {useDropzone} from "react-dropzone"
import { Button } from "./ui/button";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { uploadFile } from "@/lib/actions/file.actions";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string, 
  accountId: string,
  className?: string
}

const FileUploader = ({ownerId, accountId, className} : Props) => {
  const {toast} = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const path = usePathname();

  // use the useCallback hook for optimisation
  const onDrop = useCallback( (acceptedFiles:File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async(file)=>{
        // dont upload file and show error toast if the file is too large
        if(file.size > MAX_FILE_SIZE){
          setFiles((prevFiles)=>prevFiles.filter((file)=>file.name!==file.name));
          console.log("File size to large");
          return toast({
            description: (
            <p className="body-2 text-white">
              <span className="font-semibold">{file.name}</span> is too large. Max file size is 50MB.
            </p>
          ),
          className:"error-toast"
          })
        }
        
        return uploadFile({file, ownerId, accountId, path}).then(
          (uploadedFile) => {
            if(uploadedFile){
              console.log("Successfully uploaded files");
              setFiles((prevFiles)=>prevFiles.filter((f)=>f.name !== uploadedFile.name))
            }
          }
        )
      })
    }, [ownerId, accountId, path]);
  
    const {getRootProps, getInputProps} = useDropzone({onDrop});
    const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName:string) => {
      e.stopPropagation();
      // remove the file from the list
      setFiles((prevFiles)=> prevFiles.filter((file)=>file.name!==fileName));
    }

    return(
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()}/>
        <Button 
          type="button"
          className={cn("uploader-button", className)}
        >
          <Image
            src="/assets/icons/upload.svg"
            alt="upload"
            width={24}
            height={24}
          />
          <p>Upload</p>
        </Button>
        {files.length > 0 && (
          <ul className="uploader-preview-list">
            <h4 className="h4 text-light-100">Uploading</h4>
            {files.map((file, index)=>{
              const {extension, fileType} = getFileType(file.name);
              return (
                <li key={`${file.name}-${index}`} className="uploader-preview-item">
                  {/* uploading image */}
                  <div className="flex items-center gap-3">
                    <Thumbnail type={fileType} extension={extension} url={convertFileToURL(file)}/>
                    <div className="preview-item-name">
                      {file.name}
                      <Image
                        src="/assets/icons/file-loader.gif"
                        width={80}
                        height={26}
                        alt="loader"
                      />
                    </div>
                  </div>

                  {/* removing image */}
                  <Image
                    src="/assets/icons/remove.svg"
                    width={24}
                    height={24}
                    alt="remove"
                    onClick={(e)=>{handleRemoveFile(e, file.name)}}
                  />
                </li>);
            })}

          </ul>
        )}
      </div>
    )

}

export default FileUploader