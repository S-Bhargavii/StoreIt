import { Models } from "node-appwrite"
import Thumbnail from "./Thumbnail"
import DateTime from "./DateTime"
import { formatDateTime } from "@/lib/utils"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Image from "next/image"

const ImageThumbnail = ({file}:{file:Models.Document})=>{
    return(
        <div className="file-details-thumbnail">
            <Thumbnail type={file.type} extension={file.extension} url={file.url}/>
            <div className="flex flex-col">
                <p className="subtitle-2 mb-1">{file.name}</p>
                <DateTime date={file.$createdAt} className="caption"/>
            </div>
        </div>
    )
}

const DetailRow = ({label, value}:{label:string, value:string}) =>{
    return (
        <div className="flex">
            <p className="file-details-label text-left">{label}</p>
            <p className="file-details-value text-left">{value}</p>
        </div>
    )
}

export const FileDetails = ({file}:{file:Models.Document}) => {
  return (
    <>
        <ImageThumbnail file={file}/>
        <DetailRow label="Format:" value={file.extension}/>
        <DetailRow label="Size:" value={file.size}/>
        <DetailRow label="Owner:" value={file.owner.fullName}/>
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)}/>
    </>
  )
}

interface shareInputProps{
    file: Models.Document,
    onInputChange: React.Dispatch<React.SetStateAction<string[]>>,
    onRemove: (email:string) => Promise<boolean>
}

export const ShareInput = ({file, onInputChange, onRemove}:shareInputProps) => {
  return (
    <>
        <ImageThumbnail file={file}/>
        <div className="share-wrapper">
            <p className="subtitle-2 pl-1 text-light-100">
                Share file with other users
            </p>
            <Input
                type="email"
                placeholder="Enter email address"
                onChange={(e)=> onInputChange(e.target.value.trim().split(","))}
                className="share-input-field"
            />
            <div className="pt-4">
                <div className="flex justify-between">
                    <p className="subtitle-2 text-light-100">Shared with</p>
                    <p className="subtitle-2 text-light-100">{file.users.length} users</p>
                    <ul className="pt-2">
                        {file.users.map((email:any)=>(
                            <li className="flex items-center justify-between gap-2" key={email}>
                                <p className="subtitle-2 text-left" >{email}</p>
                                <Button onClick={()=>onRemove(email)} className="share-remove-user">
                                    <Image 
                                        src="/assets/icons/remove.svg" 
                                        alt="remove" 
                                        width={24} 
                                        height={24} 
                                        className="remove-icon"
                                    />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </>
  )
}

export const DeleteConfirmation = ({file}:{file:Models.Document}) =>{
    return(
        <p className="delete-confirmation">
            Are you sure you want to delete {` `} <span className="delete-file-name">{file.name}</span>
        </p>
    )
}