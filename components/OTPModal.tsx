'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { sendEmailOTP, verifyOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
  
  
const OtpModal = ({email, accountId}:{email:string, accountId:string}) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [password, setPassword]  = useState("");
    
    // handle submit OTP - e:React.MouseEvent<HTMLButtonElement>
    const handleSubmit = async () =>{
        try{
            const sessionId = await verifyOTP(accountId, password);
            if(sessionId){
                router.push("/");
            }
        } catch(error){
            console.log("Failed to verify OTP", error);
        }
    }

    // handle when user chooses to resend OTP 
    const handleResend = async () => {
        await sendEmailOTP(email);
    }

    return(
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="shad-alert-dialog">

                <AlertDialogHeader className="relative flex justify-center">
                <AlertDialogTitle className="h2 text-center">
                    Enter your OTP
                    <Image 
                        src="/assets/icons/close-dark.svg" 
                        alt="close" 
                        width={20}
                        height={20}
                        onClick={()=>setIsOpen(false)}
                        className="otp-close-button"
                    />
                </AlertDialogTitle>
                <AlertDialogDescription className="subtitle-2 text-center text-light-100">
                    We have sent a 6 digit code to <span className="pl-1 text-brand">{email}</span>
                </AlertDialogDescription>
                </AlertDialogHeader>

                <InputOTP maxLength={6} value={password} onChange={setPassword}>
                    <InputOTPGroup className="shad-otp">
                        <InputOTPSlot index={0} className="shad-otp-slot"/>
                        <InputOTPSlot index={1} className="shad-otp-slot"/>
                        <InputOTPSlot index={2} className="shad-otp-slot"/>
                        <InputOTPSlot index={3} className="shad-otp-slot"/>
                        <InputOTPSlot index={4} className="shad-otp-slot"/>
                        <InputOTPSlot index={5} className="shad-otp-slot"/>
                    </InputOTPGroup>
                </InputOTP>

                <AlertDialogFooter>
                    <div className="flex w-full flex-col gap-4">
                        <AlertDialogAction onClick={handleSubmit} className="shad-submit-btn h-12" type="button">
                            Submit
                        </AlertDialogAction>
                        <div className="subtitle-2 mt-2 text-center text-light-100">
                            <span>Didn&apos;t get a code?</span>
                            <Button type="button" variant="link" className="pl-1 text-brand" onClick={handleResend}>
                                Click to resend.
                            </Button>
                        </div>
                    </div>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}

export default OtpModal;