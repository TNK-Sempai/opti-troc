import { v2 as cloudinary } from 'cloudinary'
import { logError } from '@/lib/logger'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

/**
 * Upload un fichier vers Cloudinary
 * @param file - Le fichier à upload (File ou Buffer)
 * @param folder - Le dossier de destination
 * @returns URL du fichier uploadé
 */
export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  try {
    // Convertir File en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: file.type.startsWith('image/')
            ? [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
              ]
            : undefined,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!.secure_url)
        }
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    logError('uploadToCloudinary', error)
    throw new Error('Erreur lors de l\'upload du fichier')
  }
}

/**
 * Upload plusieurs fichiers vers Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Générer le nom du dossier pour un utilisateur
 * Format: usr{user_id}_{company_name}_{postal_code}/
 */
export function getUserFolder(
  userId: string,
  companyName: string,
  postalCode: string,
  subfolder?: string
): string {
  const sanitizedCompany = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20)
  
  const basePath = `opti-troc/usr${userId}_${sanitizedCompany}_${postalCode}`
  
  return subfolder ? `${basePath}/${subfolder}` : basePath
}