'use client'

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { actionsDropdownItems } from "@/constants";
import { constructDownloadURL } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { DeleteConfirmation, FileDetails, ShareInput } from "./ActionsModalContent";
  
const ActionDropDown = ({file}:{file:Models.Document}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType|null>(null); 
  const [name, setName] = useState(file.name);
  const [emails, setEmails] = useState<string[]>([]);
  const path = usePathname();

  // closes all the open modals
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(false);
  }

  const handleAction = async() => {
    if(!action) return;
    let success : boolean| void = false ;
    const actions = {
        rename: handleRename,
        share: handleShare,
        delete:handleDelete
    }

    success = await actions[action.value as keyof typeof actions]();
    if(success) closeAllModals();
  }
  
  const handleRename = async () => {
    const ret = await renameFile({fileId: file.$id, name, extension: file.extension, path})
    if(ret){
      return true;
    }else{
      return false;
    }
  }

  const handleShare = async() => {
    // TO DO - the user the file has been shared with can't remove the owner
    const ret = await updateFileUsers({fileId: file.$id, emails, path})
    if(ret){
      return true;
    }else{
      return false;
    }
  }

  const handleDelete = async() => {
    const ret = await deleteFile({fileId: file.$id, bucketFileId: file.bucketFileId, path});
    if(ret){
      return true;
    }
    return false;
  }

  const handleRemoveUser = async (email:string) => {
    const updatedEmails : string[] = emails.filter((e)=>(e!== email));
    const ret = await updateFileUsers({fileId: file.$id, emails: updatedEmails, path});
    if(ret) setEmails(updatedEmails);
    return ret;
  }

  const renderDialog = () => {
    if(!action) return null;
    const {value, label} = action;
    return (
    <DialogContent className="shad-dialog-button">
        <DialogHeader className="flex flex-col gap-3">
            <DialogTitle className="text-center text-light-100">{label}</DialogTitle>
            {value === "rename" && <Input type="text" value={name} onChange={(e)=>setName(e.target.value)}></Input>}
            {value === "details" && <FileDetails file={file}/>}
            {value === "share" && <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser}/>}
            {value === "delete" && <DeleteConfirmation file={file}/>}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
            <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button onClick={closeAllModals} className="modal-cancel-button">Cancel</Button>
                <Button onClick={handleAction} className="modal-submit-button"><p className="capitalise">{value}</p></Button>
            </DialogFooter>
        )}
    </DialogContent>
  )
}

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="shad-no-focus">
                <Image src="/assets/icons/dots.svg" alt="docs" width={34} height={34}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="max-w-[200px] truncate">{file.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actionsDropdownItems.map((actionItem)=>(
                    <DropdownMenuItem key={actionItem.value} className="shad-dropdown-item" onClick={()=>{
                        setAction(actionItem);
                        if(["rename", "share", "delete", "details"].includes(actionItem.value)){
                            setIsModalOpen(true);
                        }
                    }}>
                        {actionItem.value === "download" ?
                            <Link href={constructDownloadURL(file.bucketFileId)} download={file.name} className="flex items-center gap-2">
                                <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30}/>
                                {actionItem.label}
                            </Link> :
                            <div className="flex items-center gap-2">
                                <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30}/>
                                {actionItem.label}
                            </div>
                        }
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        {renderDialog()}
    </Dialog>    
  )
}

export default ActionDropDown