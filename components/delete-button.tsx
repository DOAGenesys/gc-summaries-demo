"use client"

import { useState, useTransition } from "react"
import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteConversation } from "@/app/actions/conversations"

interface DeleteButtonProps {
    id: number
    summaryType: string
    hasChildren?: boolean
    labels: {
        delete: string
        deleteConfirmTitle: string
        deleteConfirmDescription: string
        deleteParentWarning: string
        cancel: string
        confirm: string
        deleting: string
    }
}

export function DeleteButton({ id, summaryType, hasChildren, labels }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteConversation(id)
            if (result.success) {
                setOpen(false)
            } else {
                console.error("Failed to delete:", result.error)
            }
        })
    }

    const isParent = summaryType === "Conversation"

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
                className="sm:max-w-md rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="text-left">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="size-6 text-red-600" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                {labels.deleteConfirmTitle}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-base text-gray-600 leading-relaxed">
                                {labels.deleteConfirmDescription}
                            </AlertDialogDescription>
                        </div>
                    </div>

                    {isParent && hasChildren && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                <AlertTriangle className="size-4" />
                                {labels.deleteParentWarning}
                            </p>
                        </div>
                    )}
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-6 flex-row gap-3 sm:gap-3">
                    <AlertDialogCancel
                        disabled={isPending}
                        className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold"
                    >
                        {labels.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {labels.deleting}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Trash2 className="size-4" />
                                {labels.confirm}
                            </span>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
