'use client';

export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm">{label}</p>
        </div>
    );
}
