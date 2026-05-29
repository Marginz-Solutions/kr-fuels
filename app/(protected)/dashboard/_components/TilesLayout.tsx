import React from 'react'

interface Props {
    children: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
}

export const TilesLayout = ({ children, title, description, className }: Props) => {
    return (
        <div className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col ${className ?? ''}`}>
            <div className="mb-4">
                <div className="flex items-center gap-1.5">
                    <div className="font-semibold text-[#1a2e29] text-[15px]">{title}</div>
                </div>
                {description && (
                    <div className="text-xs text-[#5a7872]">{description}</div>
                )}
            </div>
            {children}
        </div>
    )
}
