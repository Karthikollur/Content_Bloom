'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, FileAudio, FileVideo } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatFileSize, getSourceTypeFromFile } from '@/lib/utils/helpers'
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES, ACCEPTED_EXTENSIONS } from '@/lib/utils/constants'

export function UploadZone() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Text/URL input mode
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'url'>('file')
  const [textContent, setTextContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
    }
    if (!ACCEPTED_FILE_TYPES.includes(f.type)) {
      return 'Unsupported file type. Please upload MP3, WAV, M4A, MP4, or MOV.'
    }
    return null
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validationError = validateFile(droppedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(droppedFile)
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^.]+$/, ''))
      }
    }
  }, [title])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^.]+$/, ''))
      }
    }
  }

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your content.')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Please sign in to upload content.')
      }

      if (inputMode === 'file' && file) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        setUploadProgress(10)

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw new Error(uploadError.message)

        setUploadProgress(60)

        // Store storage path (private bucket); transcribe route signs on read.
        const { data: asset, error: insertError } = await supabase
          .from('assets')
          .insert({
            user_id: user.id,
            title: title.trim(),
            source_type: getSourceTypeFromFile(file),
            source_url: filePath,
            file_size_bytes: file.size,
            status: 'uploaded',
          })
          .select()
          .single()

        if (insertError || !asset) throw new Error(insertError?.message ?? 'Failed to create asset')

        setUploadProgress(100)
        const fileAsset = asset as Record<string, unknown>
        const assetId = String(fileAsset.id)

        // Kick off transcription pipeline; runs in the background.
        void fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        }).catch(() => {
          // Pipeline failures surface via asset.status on the detail page.
        })

        router.push(`/dashboard/asset/${assetId}`)
      } else if (inputMode === 'text' && textContent.trim()) {
        // Text input — create asset directly
        const { data: asset, error: insertError } = await supabase
          .from('assets')
          .insert({
            user_id: user.id,
            title: title.trim(),
            source_type: 'text',
            transcript: textContent.trim(),
            status: 'uploaded',
          })
          .select()
          .single()

        if (insertError || !asset) throw new Error(insertError?.message ?? 'Failed to create asset')

        const textAsset = asset as Record<string, unknown>
        router.push(`/dashboard/asset/${textAsset.id}`)
      } else if (inputMode === 'url' && sourceUrl.trim()) {
        // URL input — create asset with URL
        const { data: asset, error: insertError } = await supabase
          .from('assets')
          .insert({
            user_id: user.id,
            title: title.trim(),
            source_type: 'url',
            source_url: sourceUrl.trim(),
            status: 'uploaded',
          })
          .select()
          .single()

        if (insertError || !asset) throw new Error(insertError?.message ?? 'Failed to create asset')

        const urlAsset = asset as Record<string, unknown>
        router.push(`/dashboard/asset/${urlAsset.id}`)
      } else {
        throw new Error('Please provide content to upload.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input mode tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 mb-6">
        {(['file', 'text', 'url'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              inputMode === mode
                ? 'bg-accent-soft text-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {mode === 'url' ? 'URL' : mode}
          </button>
        ))}
      </div>

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-text-secondary text-sm mb-1.5">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          placeholder="Name your content"
        />
      </div>

      {/* File upload zone */}
      {inputMode === 'file' && (
        <>
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-accent bg-accent-soft'
                  : 'border-border hover:border-text-tertiary'
              }`}
            >
              <Upload className="text-text-tertiary mx-auto mb-3" size={32} />
              <p className="text-text-primary font-medium mb-1">
                Drag & drop your file here, or click to browse
              </p>
              <p className="text-text-tertiary text-sm">
                MP3, WAV, M4A, MP4, MOV &middot; Up to 500MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {file.type.startsWith('video/') ? (
                    <FileVideo className="text-accent" size={20} />
                  ) : (
                    <FileAudio className="text-accent" size={20} />
                  )}
                  <div>
                    <p className="text-text-primary text-sm font-medium">{file.name}</p>
                    <p className="text-text-tertiary text-xs">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 w-full h-1.5 bg-border rounded-full">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Text input */}
      {inputMode === 'text' && (
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="w-full h-48 bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          placeholder="Paste your blog post, article, or text content here..."
        />
      )}

      {/* URL input */}
      {inputMode === 'url' && (
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          placeholder="https://youtube.com/watch?v=... or https://yourblog.com/post"
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-lg mt-4">{error}</div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={
          uploading ||
          !title.trim() ||
          (inputMode === 'file' && !file) ||
          (inputMode === 'text' && !textContent.trim()) ||
          (inputMode === 'url' && !sourceUrl.trim())
        }
        className="w-full mt-6 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload Content
          </>
        )}
      </button>
    </div>
  )
}
