declare interface UploadFileProps{
    file:File,
    ownerId:string, 
    accountId:string, 
    path:string
}

// Link to file conventions 
// tldr - every page.tsx is passed params and search params
// https://nextjs.org/docs/app/api-reference/file-conventions/page 
declare interface SearchParamProps{
    params?: Promise<SegmentParams>;
    searchParams?: Promise<{[key:string]: string| string[] | undefined}>;
}

declare interface ActionType {
    label: string;
    icon: string;
    value: string;
  }