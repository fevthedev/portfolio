'use client';
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md p-4">
      <h1 className="text-xl text-west-tech-blue font-bold mb-6">WT Logistics Admin</h1>
      <ul className="space-y-4">
        <li><Link href="/">Dashboard</Link></li>
        <li><Link href="/upload">File Uploads</Link></li>
        <li><Link href="/shipments">Shipments</Link></li>
      </ul>
    </div>
  );
}
