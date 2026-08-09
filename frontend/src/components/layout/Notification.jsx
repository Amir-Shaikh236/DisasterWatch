import { Bell } from "lucide-react";
import { Button } from "../ui/button";

export default function Notification() {
    return (
        <div className='z-20 sticky'>
            <div className="relative flex items-center justify-end">
                <Button variant="ghost" size="icon-lg" className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}