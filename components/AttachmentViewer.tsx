import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { FileText, Download, Eye } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { FileAttachment } from '@/types/files';
import { formatFileSize } from '@/services/fileService';

interface AttachmentViewerProps {
  attachments: FileAttachment[];
  showTitle?: boolean;
}

export default function AttachmentViewer({ attachments, showTitle = true }: AttachmentViewerProps) {
  const handleAttachmentPress = async (attachment: FileAttachment) => {
    try {
      if (attachment.type === 'image') {
        Alert.alert('Image Viewer', 'Image viewer would open here');
      } else if (attachment.type === 'video') {
        Alert.alert('Video Player', 'Video player would open here');
      } else {
        const supported = await Linking.canOpenURL(attachment.url);
        if (supported) {
          await Linking.openURL(attachment.url);
        } else {
          Alert.alert('Cannot Open', 'No app available to open this file type');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const getFileIcon = (attachment: FileAttachment) => {
    if (attachment.type === 'image') {
      return (
        <Image 
          source={{ uri: attachment.url }} 
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      );
    }
    return <FileText size={24} color={COLORS.primary} />;
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>
          Attachments ({attachments.length})
        </Text>
      )}
      
      <View style={styles.attachmentsGrid}>
        {attachments.map((attachment) => (
          <TouchableOpacity
            key={attachment.id}
            style={styles.attachmentCard}
            onPress={() => handleAttachmentPress(attachment)}
          >
            <View style={styles.thumbnailContainer}>
              {getFileIcon(attachment)}
            </View>
            
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={2}>
                {attachment.name}
              </Text>
              <Text style={styles.attachmentSize}>
                {formatFileSize(attachment.size)}
              </Text>
              <View style={styles.attachmentActions}>
                <View style={styles.typeIndicator}>
                  <Text style={styles.typeText}>
                    {attachment.type.toUpperCase()}
                  </Text>
                </View>
                <Eye size={16} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnailContainer: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  attachmentSize: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: COLORS.textMedium,
    marginBottom: 6,
  },
  attachmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeIndicator: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 8,
    color: COLORS.primary,
  },
});