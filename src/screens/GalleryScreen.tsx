import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function GalleryScreen() {
  const captions = useSelector((state: RootState) => state.captions.items);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>Your AI-captioned memories</Text>
      </View>

      {captions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No images yet</Text>
          <Text style={styles.emptySubtitle}>
            Take some photos to see them here with AI captions!
          </Text>
        </View>
      ) : (
        <View style={styles.galleryContainer}>
          {captions.map((caption) => (
            <View key={caption.id} style={styles.captionCard}>
              <Text style={styles.captionText}>{caption.shortDescription}</Text>
              <Text style={styles.timestampText}>
                {new Date(caption.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  galleryContainer: {
    padding: 20,
  },
  captionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  captionText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 14,
    color: '#64748b',
  },
});