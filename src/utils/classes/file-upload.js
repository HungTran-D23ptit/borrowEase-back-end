import fs from 'fs'
import path from 'path'
import bytes from 'bytes'
import mime from 'mime-types'
import {PUBLIC_DIR, UUID_TRANSLATOR} from '@/configs'
import sharp from 'sharp'
import cloudinary from '@/configs/cloudinary'

class FileUpload {
    static UPLOAD_FOLDER = 'uploads'

    constructor({originalname, mimetype, buffer}) {
        this.originalname = originalname
        this.mimetype = mimetype
        this.buffer = buffer
        const originalNames = typeof originalname === 'string' ? originalname.split('.') : []
        const ext = originalNames.length > 1 ? originalNames.pop() : mime.extension(this.mimetype)
        this.filename = `${UUID_TRANSLATOR.generate()}.${ext}`
    }

    toJSON() {
        const {buffer, ...rest} = this
        rest.filesize = bytes(Buffer.byteLength(buffer))
        return rest
    }

    toString() {
        return this.filepath || this.originalname
    }

    isImage() {
        return /^image\/(.*)\/?$/i.test(this.mimetype)
    }

    async save(...paths) {
        if (!this.filepath) {
            return new Promise((resolve, reject) => {
                const folder = [FileUpload.UPLOAD_FOLDER, ...paths].join('/')
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder,
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) return reject(error)
                        this.filepath = result.secure_url
                        resolve(this.filepath)
                    }
                )
                uploadStream.end(this.buffer)
            })
        } else {
            throw new Error('File saved. Use the "filepath" attribute to retrieve the file path.')
        }
    }

    static async remove(fileUrl) {
        if (!fileUrl || !fileUrl.includes('cloudinary.com')) return
        try {
            // Trích xuất public_id từ URL Cloudinary
            const parts = fileUrl.split('/')
            const fileNameWithExt = parts.pop()
            const fileName = fileNameWithExt.split('.')[0]
            const folderPart = parts.slice(parts.indexOf(FileUpload.UPLOAD_FOLDER)).join('/')
            const publicId = `${folderPart}/${fileName}`
            
            await cloudinary.uploader.destroy(publicId)
        } catch (error) {
            console.error('Error removing file from Cloudinary:', error)
        }
    }
}

export default FileUpload
