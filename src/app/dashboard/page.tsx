import Link from 'next/link'
import { Upload } from 'lucide-react'
import { AssetList } from '@/components/features/AssetList'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Your content at a glance</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Upload size={16} />
          Upload
        </Link>
      </div>

      <AssetList />
    </div>
  )
}
