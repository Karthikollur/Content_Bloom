import { UploadZone } from '@/components/features/UploadZone'

export default function UploadPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-text-primary text-2xl font-semibold">Upload Content</h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload audio, video, or paste text to generate platform-optimized content.
        </p>
      </div>

      <UploadZone />
    </div>
  )
}
