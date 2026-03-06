export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface UploadRequest {
  title: string
  sourceType: 'audio' | 'video' | 'text' | 'url'
  content?: string
  sourceUrl?: string
}

export interface UploadResponse {
  assetId: string
  uploadUrl?: string
}

export interface ProcessRequest {
  assetId: string
}

export interface AssetWithOutputs {
  id: string
  title: string
  source_type: string
  status: string
  created_at: string
  outputs: {
    id: string
    platform: string
    content: string
    version: number
  }[]
}
