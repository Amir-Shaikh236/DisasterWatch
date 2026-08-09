import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from 'zod'

import { Field, FieldGroup, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Radio, ShieldCheck, BellRing } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/store/AuthProvider";
import { toast } from "sonner";
import { useContext, useEffect } from "react";
import { publicClient } from "@/api/api";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid Email Address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

function StatusItem({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-teal-400">
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-300">{text}</p>
        </div>
    )
}

export default function Login() {

    const { updateToken, accessToken } = useContext(AuthContext)
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const { isSubmitting } = form.formState;

    useEffect(() => {
        if (accessToken) navigate('/dashboard');
    }, [accessToken, navigate]);

    const withMinDelay = (promise, ms = 2500) => {
        return Promise.all([
            promise,
            new Promise((resolve) => setTimeout(resolve, ms))
        ]).then(([result]) => result);
    }

    const onsubmit = async (data) => {
        const payload = {
            email: data.email,
            password: data.password
        }

        const loginPromise = withMinDelay(publicClient.post('/api/auth/login', payload), 2500);

        toast.promise(loginPromise, {
            loading: 'Logging you in...',
            success: (response) => {
                const { user } = response.data;
                return `Logged in successfully, ${user?.firstName} ${user?.lastName}!`;
            },
            error: (error) => error.response?.data?.message || "Incorrect email or password",
        });

        const response = await loginPromise;
        const { accessToken } = response.data;

        updateToken(accessToken);
        navigate('/dashboard');
        form.reset();

        return response;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">

            <div className="lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div className="flex items-center gap-2 text-teal-400 mb-6">
                    <Radio className="h-5 w-5" />
                    <span className="text-sm font-mono tracking-widest uppercase">DisasterWatch</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 leading-tight mb-3">
                    Welcome back.
                </h1>
                <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-md">
                    Your alerts, your location, your history — all exactly where you left them. Sign in to keep monitoring.
                </p>

                <div className="space-y-5">
                    <StatusItem icon={BellRing} text="Your alert preferences stay saved between sessions." />
                    <StatusItem icon={ShieldCheck} text="Your account and location data stay private to you." />
                </div>
            </div>

            {/* Right: login form */}
            <div className="lg:w-1/2 flex items-center justify-center px-4 py-12 sm:px-6">
                <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 backdrop-blur space-y-6 rounded shadow-md">
                    <CardHeader className="flex justify-center items-center flex-col mt-3">
                        <CardTitle as="h2" className="text-2xl font-semibold text-slate-50"> Log in </CardTitle>
                        <CardDescription className="text-slate-400"> Welcome back! Please sign in to your account. </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">
                        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-4">
                            <FieldGroup>
                                <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email" className="text-slate-300"> Email </FieldLabel>
                                        <Input {...field} id="email" aria-invalid={fieldState.invalid} placeholder="Enter Your Email" autoComplete="off" className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all rounded" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />

                                <Controller name="password" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password" className="text-slate-300"> Password </FieldLabel>
                                        <Input {...field} id="password" type='password' aria-invalid={fieldState.invalid} placeholder="Enter your Password" autoComplete="off" className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all rounded" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>

                            <Button
                                type="submit"
                                className="w-full h-10 rounded cursor-pointer mt-2 bg-teal-600 text-white hover:bg-teal-500 transition-colors text-[16px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )} {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col w-full border-t border-slate-800/60 pt-4 bg-transparent">
                        <p className="text-center text-sm text-slate-400">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-teal-400 cursor-pointer hover:underline">Register</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}