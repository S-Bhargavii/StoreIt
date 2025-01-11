'use client'

import Image from "next/image"
import { useEffect, useState } from "react"
import { Input } from "./ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import DateTime from "./DateTime";
import {useDebounce} from "use-debounce";
// import { useRouter } from "next/router";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = useState<Models.Document[]>([]);
  const router = useRouter();
  const path = usePathname();
  // this is for the modal that appears below showing the names of the files that match the query requirements
  const [open, setOpen] = useState(true);
  const [debouncedQuery] = useDebounce(query, 3000);

  const handleClickItem = (file:Models.Document) => {
    setOpen(false);
    setResults([]);
    router.push(`/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`);
  }

  useEffect(()=>{
    const fetchFiles = async () => {
      if(!debouncedQuery){
        setResults([]);
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const files = await getFiles(undefined, debouncedQuery);
      
      setResults(files.documents);
      setOpen(true);
    };
    fetchFiles();
  }, [debouncedQuery]);

  // callback that is called when a var in dependency list changes
  useEffect(()=>{
    if(!searchQuery){
      setQuery("")
    }
  }, [searchQuery]);

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image 
          src="/assets/icons/search.svg" 
          alt="Search" 
          width={20} 
          height={20}
        />
        <Input 
          value={query} 
          placeholder="Search..." 
          className="search-input" 
          onChange={(e)=>setQuery(e.target.value)}
        />
        {open && (
          <ul className="search-result">
            {results.length > 0 ? 
            (
              results.map((file)=>
                <li key={file.$id} className="flex items-center justify-between" onClick={()=>handleClickItem(file)}>
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail 
                      type={file.type} 
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">{file.name}</p>
                  </div>
                  <DateTime date={file.$createdAt} className="caption line-clamp-1 text-light-200"/> 
                </li>
              )
            ):
            (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Search