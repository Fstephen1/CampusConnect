export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface MediaFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}