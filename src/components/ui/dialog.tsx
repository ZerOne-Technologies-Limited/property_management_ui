"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
} | null>(null)

const useDialog = () => {
    const context = React.useContext(DialogContext)
    if (!context) {
        throw new Error("useDialog must be used within specific Dialog components")
    }
    return context
}

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

    // Controlled vs Uncontrolled
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : uncontrolledOpen
    const setIsOpen = isControlled ? onOpenChange : setUncontrolledOpen

    // Handlers
    const handleOpenChange = (newOpen: boolean) => {
        if (setIsOpen) {
            setIsOpen(newOpen)
        }
    }

    return (
        <DialogContext.Provider value={{ open: !!isOpen, onOpenChange: handleOpenChange }}>
            {children}
            {/* isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0">
                     <div className="fixed inset-0" onClick={() => handleOpenChange(false)} />
                     We render children normally, but content will portal or check context
                </div>
            ) */}
        </DialogContext.Provider>
    )
}

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        onOpenChange(true)
    }

    // If asChild is true, we should clone the child and add the click handler, 
    // but for simplicity in this custom implementation, we'll wrap it or just render a button if not asChild.
    // Real radix uses Slot. Here we'll just wrap in a span if we can't clone safely or just rely on bubbling?
    // Simplest for now: Render a clone if single child, else wrap.
    // Or just require the user to click this element.

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                (children as any).props.onClick?.(e);
                handleClick(e as any);
            }
        })
    }

    return (
        <button ref={ref} className={className} onClick={handleClick} {...props}>
            {children}
        </button>
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    // We need to render this conditionally in the parent or usually Radix logic handles portals.
    // In our simple "Dialog" above, we rendered children inside the overlay if isOpen.
    // BUT: DialogTrigger is ALSO a child of Dialog.
    // So validation: Dialog renders trigger AND content.
    // The overlay wrapper in Dialog wraps EVERYTHING which is wrong for Trigger.

    // FIX: Dialog shouldn't wrap everything in Overlay. 
    // Overlay should be a sibling or part of Portal.
    // Since we don't have Portal easily set up, let's just cheat:
    // We only render Content if open. Trigger is always rendered.

    // Actually, let's fix Dialog to NOT render overlay around children.
    // And DialogContent itself will render the overlay + modal IF open.
    const { open, onOpenChange } = useDialog()

    if (!open) return null;

    return (
        // Portal logic simulated by fixed position being z-50
        // We moved the overlay HERE directly
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0" onClick={() => onOpenChange(false)} />

            {/* Modal */}
            <div
                ref={ref}
                className={cn(
                    "relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg animate-in zoom-in-95 slide-in-from-bottom-10",
                    className
                )}
                {...props}
            >
                {children}
                <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 cursor-pointer" onClick={() => onOpenChange(false)}>
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </div>
            </div>
        </div>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
