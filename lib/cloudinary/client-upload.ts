'use client'

/**
 * Upload un fichier depuis le client vers Cloudinary
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'opti-troc')
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Cloudinary error:', errorData)
    throw new Error(errorData.error?.message || 'Erreur lors de l\'upload')
  }

  const data = await response.json()
  return data.secure_url
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadFileToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}