import React from 'react'

interface Props {
    children: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
}

export const TilesLayout = ({ children, title, description, className }: Props) => {
    return (
        <div className={`bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-6 flex flex-col ${className ?? ''}`}>
            <div className="mb-4">
                <div className="flex items-center gap-1.5">
                    <div className="font-semibold text-ink text-[15px]">{title}</div>
                </div>
                {description && (
                    <div className="text-xs text-mutedfg">{description}</div>
                )}
            </div>
            {children}
        </div>
    )
}
