import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { AuthContext } from "@/store/AuthProvider"
import * as z from "zod"

import { Field, FieldGroup, FieldError, FieldLabel } from "@/components/ui/field"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Radio, Zap, MapPin, Waves, Flame, Wind, Activity } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { publicClient } from "@/api/api"
import { useUser } from "@/store/useUser"


const formSchema = z.object({
    firstName: z.string().trim().min(1, { message: "First Name is required" }),
    lastName: z.string().trim().min(1, { message: "Last Name is required" }),
    email: z.string().email({ message: 'Please enter a Valid Email' }),
    password: z.string().min(8, { message: 'Password must be atleast 8 characters long' }),
    confirmPassword: z.string()
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Confirm password must match Password",
        path: ["confirmPassword"],
    })

// Illustrative preview only — not live data
const liveFeed = [
    { time: "2m ago", icon: Waves, label: "Flood warning", place: "Kolhapur district" },
    { time: "14m ago", icon: Flame, label: "Wildfire risk elevated", place: "Nashik hills" },
    { time: "26m ago", icon: Wind, label: "Cyclone advisory", place: "Konkan coast" },
    { time: "1h ago", icon: Activity, label: "Seismic activity detected", place: "Latur region" },
]

function ValueProp({ icon: Icon, title, desc }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-amber-400">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-200">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
            </div>
        </div>
    )
}

export default function SignUp() {
    const [isLoading, setIsLoading] = useState(false);
    const { updateToken } = useContext(AuthContext);
    const navigate = useNavigate()
    const { setUser } = useUser.getState();

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const withMinDelay = (promise, ms = 2500) => {
        return Promise.all([
            promise,
            new Promise((resolve) => setTimeout(resolve, ms))
        ]).then(([result]) => result);
    }

    const onsubmit = async (data) => {
        setIsLoading(true);

        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password
        }

        toast.promise(
            withMinDelay(publicClient.post('api/auth/register', payload), 2500),
            {
                loading: 'Creating your account...',
                success: (response) => {
                    const { accessToken } = response.data;
                    setUser(response.data?.user);
                    updateToken(accessToken)

                    form.reset();
                    navigate('/dashboard');
                    return `${payload.firstName} ${payload.lastName} account created successfully!`;
                },

                error: (error) => error.response?.data?.message || "Failed creating account",
                finally: () => setIsLoading(false)
            }
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">

            {/* Left: brand + value props + live feed */}
            <div className="lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div className="flex items-center gap-2 text-teal-400 mb-6">
                    <Radio className="h-5 w-5" />
                    <span className="text-sm font-mono tracking-widest uppercase">DisasterWatch</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 leading-tight mb-3">
                    Know before it arrives.
                </h1>
                <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-md">
                    DisasterWatch tracks floods, cyclones, earthquakes, and wildfires in real time, and sends an alert to your phone the moment your area is at risk.
                </p>

                <div className="space-y-5 mb-10">
                    <ValueProp icon={Radio} title="Multi-hazard monitoring" desc="One system watching for floods, storms, quakes, and fires — not five different apps." />
                    <ValueProp icon={Zap} title="Alerts in seconds" desc="Push notifications reach you the moment a threat is detected near your location." />
                    <ValueProp icon={MapPin} title="Built for your area" desc="Set your location once; every alert is filtered to what's actually near you." />
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                        </span>
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Live feed preview</span>
                    </div>
                    <ul className="space-y-3">
                        {liveFeed.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <item.icon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                                <p className="flex-1 min-w-0 text-slate-200 truncate">
                                    {item.label} <span className="text-slate-500">— {item.place}</span>
                                </p>
                                <span className="font-mono text-xs text-slate-500 shrink-0">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right: registration form */}
            <div className="lg:w-1/2 flex items-center justify-center px-4 py-12 sm:px-6">
                <Card className="w-full max-w-lg bg-slate-900/60 border-slate-800 backdrop-blur space-y-6 shadow-lg rounded">
                    <CardHeader className="flex items-center justify-center flex-col mt-4">
                        <CardTitle className="text-2xl font-semibold text-slate-50">Create your account</CardTitle>
                        <CardDescription className="text-slate-400">Start receiving alerts for your area</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">

                        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FieldGroup className="flex-1">
                                    <Controller name="firstName" control={form.control} render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor='firstName' className="pb-1 text-slate-300"> First Name</FieldLabel>
                                            <Input {...field} id='firstName' aria-invalid={fieldState.invalid} placeholder='Enter Your First Name' className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all outline-none rounded" />
                                            {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                        </Field>
                                    )} />
                                </FieldGroup>

                                <FieldGroup className="flex-1">
                                    <Controller name="lastName" control={form.control} render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor='lastName' className="pb-1 text-slate-300"> Last Name</FieldLabel>
                                            <Input {...field} id='lastName' aria-invalid={fieldState.invalid} placeholder='Enter Your last Name' className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all outline-none rounded" />
                                            {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                        </Field>
                                    )} />
                                </FieldGroup>
                            </div>

                            <FieldGroup>
                                <Controller name="email" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email" className="text-slate-300"> Email </FieldLabel>
                                        <Input {...field} id="email" aria-invalid={fieldState.invalid} placeholder="Email" autoComplete="off" className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all outline-none rounded" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>

                            <FieldGroup>
                                <Controller name="password" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password" className="text-slate-300"> Password </FieldLabel>
                                        <Input {...field} type='password' id='password' aria-invalid={fieldState.invalid} placeholder='password' autoComplete="off" className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all outline-none rounded" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>

                            <FieldGroup>
                                <Controller name="confirmPassword" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="confirmPassword" className="text-slate-300"> Confirm Password </FieldLabel>
                                        <Input {...field} type='password' id='confirmPassword' aria-invalid={fieldState.invalid} placeholder='Confirm Password' autoComplete="off" className="w-full h-10 px-4 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-400 transition-all outline-none rounded" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>

                            <Button type='submit' disabled={isLoading} className="w-full h-10 cursor-pointer bg-teal-600 text-white hover:bg-teal-500 transition-colors text-[16px] rounded">
                                {isLoading && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)} {isLoading ? "Creating Account..." : "Register"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col w-full border-t border-slate-800/60 pt-4 bg-transparent">
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link to="/" className="text-teal-400 cursor-pointer hover:underline"> Login </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}