import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { googleBooksService } from '../services/googleBooksService';

const BookDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params;
  const { volumeInfo } = book;

  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [success, setSuccess] = useState(false);

  const handlePreviewLink = async () => {
    if (volumeInfo.previewLink) {
      try {
        await Linking.openURL(volumeInfo.previewLink);
      } catch (error) {
        Alert.alert('Error', 'Could not open the preview link');
      }
    }
  };

  const handleInfoLink = async () => {
    if (volumeInfo.infoLink) {
      try {
        await Linking.openURL(volumeInfo.infoLink);
      } catch (error) {
        Alert.alert('Error', 'Could not open the info link');
      }
    }
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;

    const newComment = {
      text: comment,
      name: 'User', // Replace with actual user name when authentication is implemented
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR'),
    };

    setComments([...comments, newComment]);
    setComment('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const renderRating = () => {
    if (!volumeInfo.averageRating) return null;
    
    const rating = Math.round(volumeInfo.averageRating);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingStars}>{stars}</Text>
        <Text style={styles.ratingCount}>
          ({volumeInfo.ratingsCount || 0} değerlendirme)
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x220.png?text=Kapak+Yok',
            }}
            style={styles.coverImage}
            resizeMode="contain"
          />
        </View>

        {/* Book Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{volumeInfo.title}</Text>
          
          {volumeInfo.subtitle && (
            <Text style={styles.subtitle}>{volumeInfo.subtitle}</Text>
          )}

          {volumeInfo.authors && (
            <Text style={styles.author}>
              Yazar: {volumeInfo.authors.join(', ')}
            </Text>
          )}

          {/* Additional Details */}
          <View style={styles.detailsList}>
            {volumeInfo.publisher && (
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Yayınevi: </Text>
                {volumeInfo.publisher}
              </Text>
            )}
            {volumeInfo.publishedDate && (
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Yayın Tarihi: </Text>
                {new Date(volumeInfo.publishedDate).toLocaleDateString('tr-TR')}
              </Text>
            )}
            {volumeInfo.pageCount && (
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sayfa: </Text>
                {volumeInfo.pageCount}
              </Text>
            )}
            {volumeInfo.language && (
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dil: </Text>
                {volumeInfo.language.toUpperCase()}
              </Text>
            )}
          </View>

          {/* Description */}
          {volumeInfo.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{volumeInfo.description}</Text>
            </View>
          )}

          {/* Categories */}
          {volumeInfo.categories && volumeInfo.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>Kategoriler</Text>
              <View style={styles.categoriesList}>
                {volumeInfo.categories.map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rating */}
          {renderRating()}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {volumeInfo.previewLink && (
              <TouchableOpacity
                style={[styles.button, styles.previewButton]}
                onPress={handlePreviewLink}
              >
                <Text style={styles.buttonText}>Google Books'ta Görüntüle</Text>
              </TouchableOpacity>
            )}
            {volumeInfo.infoLink && (
              <TouchableOpacity
                style={[styles.button, styles.infoButton]}
                onPress={handleInfoLink}
              >
                <Text style={styles.buttonText}>Daha Fazla Bilgi</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Yorum Yap</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={3}
              placeholder="Yorumunuzu yazın..."
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={[styles.button, styles.commentButton]}
              onPress={handleCommentSubmit}
              disabled={!comment.trim()}
            >
              <Text style={styles.buttonText}>Gönder</Text>
            </TouchableOpacity>
            {success && (
              <Text style={styles.successMessage}>Yorumunuz gönderildi!</Text>
            )}

            {comments.length > 0 && (
              <View style={styles.commentsList}>
                <Text style={styles.sectionTitle}>Yorumlar</Text>
                {comments.map((c, idx) => (
                  <View key={idx} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentName}>{c.name}</Text>
                      <Text style={styles.commentDate}>
                        {c.date} {c.time}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 16,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  author: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 16,
  },
  detailsList: {
    marginBottom: 16,
  },
  detailItem: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStars: {
    color: '#fbbf24',
    fontSize: 18,
  },
  ratingCount: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButton: {
    backgroundColor: '#dc2626',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  commentButton: {
    backgroundColor: '#dc2626',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  commentSection: {
    marginTop: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  successMessage: {
    color: '#059669',
    marginTop: 8,
  },
  commentsList: {
    marginTop: 16,
  },
  commentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentName: {
    fontWeight: '600',
    color: '#dc2626',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentText: {
    color: '#374151',
    fontSize: 14,
  },
});

export default BookDetail;
