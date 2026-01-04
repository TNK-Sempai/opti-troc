'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // en bytes
  onFilesChange: (files: File[]) => void
  value?: File[]
  error?: string
}

export function FileUpload({
  accept = 'image/*',
  multiple = false,
  maxSize = 5000000, // 5MB par défaut
  onFilesChange,
  value = [],
  error,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => file.size <= maxSize)
    
    if (multiple) {
      onFilesChange([...value, ...validFiles])
    } else {
      onFilesChange(validFiles.slice(0, 1))
    }
  }

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          {
            'border-primary bg-primary/5': dragActive,
            'border-neutral-300 hover:border-primary hover:bg-neutral-50': !dragActive && !error,
            'border-error bg-error/5': error,
          }
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
        <p className="text-sm text-neutral-600 mb-1">
          Glissez-déposez vos fichiers ici ou{' '}
          <span className="text-primary font-medium">parcourez</span>
        </p>
        <p className="text-xs text-neutral-500">
          {accept.includes('image') ? 'JPG, PNG, WEBP' : 'PDF, JPG, PNG'} - Max {maxSize / 1000000}MB
        </p>
      </div>

      {error && (
        <p className="text-sm text-error mt-2">{error}</p>
      )}

      {/* Preview des fichiers */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <FileText className="w-12 h-12 text-neutral-400" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {(file.size / 1000).toFixed(0)} KB
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="p-1 hover:bg-neutral-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}