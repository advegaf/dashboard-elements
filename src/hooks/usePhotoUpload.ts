import { useState, useRef, useCallback, useEffect } from 'react'

export function usePhotoUpload(initialPreview?: string) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPreview ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setPhotoPreview(url)
  }, [])

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  return { photoPreview, setPhotoPreview, fileInputRef, openFilePicker, handleFileChange }
}
