import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { FileText, Image as ImageIcon, Video, Trash2 } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { FileAttachment, MediaFile } from '@/types/files';
import { pickDocument, pickImage, pickVideo, uploadFile, deleteFile, formatFileSize } from '@/services/fileService';

interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  uploadedBy: string;
  maxFiles?: number;
}

export default function FileUploader({ attachments, onAttachmentsChange, uploadedBy, maxFiles = 5 }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFilePick = async (type: 'document' | 'image' | 'video') => {
    if (attachments.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    try {
      setUploading(true);
      let file: MediaFile | null = null;

      switch (type) {
        case 'document':
          file = await pickDocument();
          break;
        case 'image':
          file = await pickImage();
          break;
        case 'video':
          file = await pickVideo();
          break;
      }

      if (file) {
        const maxSize = 10 * 1024 * 1024;
        if (file.size && file.size > maxSize) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }

        const attachment = await uploadFile(file, uploadedBy);
        onAttachmentsChange([...attachments, attachment]);
      }
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFile(fileId);
              onAttachmentsChange(attachments.filter(att => att.id !== fileId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file.');
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (type: FileAttachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={16} color={COLORS.primary} />;
      case 'video':
        return <Video size={16} color={COLORS.primary} />;
      case 'document':
        return <FileText size={16} color={COLORS.primary} />;
      default:
        return <FileText size={16} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Attachments ({attachments.length}/{maxFiles})</Text>
      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('document')}
          disabled={uploading || attachments.length >= maxFiles}
        >
          <FileText size={20} color={uploading || attachments.length >= maxFiles ? COLORS.textLight : COLORS.primary} />
          <Text style={[styles.uploadButtonText, (uploading || attachments.length >= maxFiles) && styles.uploadButtonTextDisabled]}>
            Document
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('image')}
          disabled={uploading || attachments.length >= maxFiles}
        >
          <ImageIcon size={20} color={uploading || attachments.length >= maxFiles ? COLORS.textLight : COLORS.primary} />
          <Text style={[styles.uploadButtonText, (uploading || attachments.length >= maxFiles) && styles.uploadButtonTextDisabled]}>
            Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('video')}
          disabled={uploading || attachments.length >= maxFiles}
        >
          <Video size={20} color={uploading || attachments.length >= maxFiles ? COLORS.textLight : COLORS.primary} />
          <Text style={[styles.uploadButtonText, (uploading || attachments.length >= maxFiles) && styles.uploadButtonTextDisabled]}>
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.uploadingText}>Uploading file...</Text>
        </View>
      )}

      {attachments.length > 0 && (
        <ScrollView style={styles.attachmentsContainer} showsVerticalScrollIndicator={false}>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentItem}>
              <View style={styles.attachmentInfo}>
                {getFileIcon(attachment.type)}
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={styles.attachmentSize}>
                    {formatFileSize(attachment.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleFileDelete(attachment.id)}
              >
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.lightGrey,
    borderColor: COLORS.border,
  },
  uploadButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  uploadButtonTextDisabled: {
    color: COLORS.textLight,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  attachmentsContainer: {
    maxHeight: 200,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  attachmentName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.textDark,
  },
  attachmentSize: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMedium,
  },
  deleteButton: {
    padding: 8,
  },
});