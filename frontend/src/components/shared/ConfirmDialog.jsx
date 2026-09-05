import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function DeleteConfirmDialog({ open, onOpenChange, onConfirm, loading = false, itemName = "item" }) {

    return (
        <AlertDialog open={open} onOpenChange={(value) => {
            if (!loading) onOpenChange(value);
        }}>
            <AlertDialogContent size="sm" className="max-w-md! space-y-2">
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <AlertTriangle className="h-7 w-7 text-red-400" />
                    </AlertDialogMedia>
                    <AlertDialogTitle> Delete {itemName} ? </AlertDialogTitle>

                    <AlertDialogDescription>
                        {itemName === 'REPORT' ? (
                            <span>
                                This action cannot be undone.
                                Deleting this {itemName} will permanently remove the report and all of its
                                related assets, including uploaded images and associated alert.
                            </span>
                        ) : (
                            <span>
                                This action cannot be undone.
                                Deleting this {itemName} will permanently remove the alert and all of its
                                related assets, including uploaded images and associated report.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        variant="destructive"
                        className="cursor-pointer">
                        {loading ? (
                            <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Deleting....
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" /> Delete
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}