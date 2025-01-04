'use client'
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import {createAccount} from "@/lib/actions/user.actions";

// the sign up form schema object
const signUpFormSchema = z.object({
    fullName: z.string(),
    email: z.string().email(),
});
const signUpDefault = {
    fullName: "",
    email:""
};

// the sign in form schema object
const signInFormSchema = z.object({
    email: z.string().email(),
});
const signInDefault = {
    email: ""
}

type FormType = "sign-up" | "sign-in";

const AuthForm = ({type}:{type:FormType}) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [accountId, setAccountId] = useState(null)

    // choosing form schema object based on form type
    const formSchema = type==="sign-in" ? signInFormSchema : signUpFormSchema;
    const defaultValues = type==="sign-in" ? signInDefault : signUpDefault;

    // defining the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    // defining submit handler
    const onSubmit = async (values: z.infer<typeof formSchema>)=>{
       setErrorMessage("");
       try{
            const user = await createAccount({
                fullName : values.fullName || "",
                email: values.email
            })  
            setAccountId(user.accountId);
       }catch{
        setErrorMessage("Failed to create account. Please try again.");
       }
    }

    // building the form ui
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
                    <h1 className="form-title">{type==="sign-in" ? "Sign In":"Sign Up"}</h1>
                    
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className="shad-form-item">
                                    <FormLabel className="shad-form-label">Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email address." className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form-message"/>
                                </div>
                            </FormItem>
                        )}
                    />
                    
                    {type === "sign-up" && (
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="shad-form-item">
                                        <FormLabel className="shad-form-label">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name." className="shad-input" {...field} />
                                        </FormControl>
                                        <FormMessage className="shad-form-message"/>
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}

                    {/* submit button */}
                    <Button type="submit" className="form-submit-button">
                        {type==="sign-in"?"Sign In":"Sign Up"}
                    </Button>
                    
                    {/* error message */}
                    {errorMessage && <p className="error-message">*{errorMessage}</p>}

                    {/* alternate links */}
                    <div className="body-2 flex justify-center">
                        <p className="text-light-100">
                            {type==="sign-in"?"Don't have an account? ":"Already have an account? "}
                        </p>
                        <Link href={type==="sign-in"?"/sign-up":"/sign-in"} className="ml-1 font-medium text-brand">
                            {type==="sign-in"?"Sign Up":"Sign In"}
                        </Link>
                    </div>
                </form>
            </Form>
            {/*OTP Verification*/}
        </>
    )
};

export default AuthForm;
