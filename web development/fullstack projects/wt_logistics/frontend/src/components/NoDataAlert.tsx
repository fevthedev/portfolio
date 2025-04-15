import Link from 'next/link';

export default function NoDataAlert() {
    return (
        <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-yellow-800 shadow-sm">
            <div className="flex items-center gap-3">
                <svg
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                </svg>
                <p>
                    No shipment data available.{' '}
                    <Link
                        href="/upload"
                        className="font-medium text-yellow-700 underline hover:text-yellow-900"
                    >
                        Upload your data here.
                    </Link>
                </p>
            </div>
        </div>
    );
}
