import { Models } from "node-appwrite"
import Thumbnail from "./Thumbnail"
import DateTime from "./DateTime"
import { formatDateTime } from "@/lib/utils"

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
