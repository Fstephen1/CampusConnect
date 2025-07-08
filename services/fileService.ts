import { MediaFile, FileAttachment } from '@/types/files';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
const mockFileStorage: { [key: string]: FileAttachment } = {};

export const pickDocument = async (): Promise<MediaFile | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: asset.mimeType || 'application/pdf',
        name: asset.name,
        size: asset.size,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
};

export const pickImage = async (): Promise<MediaFile | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera roll is required!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const pickVideo = async (): Promise<MediaFile | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera roll is required!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'video/mp4',
        name: `video_${Date.now()}.mp4`,
        size: asset.fileSize,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking video:', error);
    return null;
  }
};

export const uploadFile = async (file: MediaFile, uploadedBy: string): Promise<FileAttachment> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const fileId = Math.random().toString(36).substring(2, 9);
  const fileType = file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' : 'document';
  
  const attachment: FileAttachment = {
    id: fileId,
    name: file.name,
    type: fileType,
    url: file.uri,
    size: file.size || 0,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  };
  
  mockFileStorage[fileId] = attachment;
  return attachment;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  delete mockFileStorage[fileId];
};

export const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('word')) return 'file-text';
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};