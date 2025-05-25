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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { getFirebaseApp } from '../services/firebaseHelper';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  increment 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFavorites } from '../contexts/FavoritesContext';

// Initialize Firestore and Auth
let db;
let auth;

const BookDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params;
  const { volumeInfo } = book;
  
  // Get user auth state from Redux
  const userData = useSelector(state => state.auth.userData);
  const isAuthenticated = useSelector(state => !!state.auth.token);
  
  // Favorites context
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Get Firebase services lazily
  useEffect(() => {
    const app = getFirebaseApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }, []);
  
  // Firebase user
  const [user, setUser] = useState(null);
  
  // Update user state when auth changes
  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [success, setSuccess] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCurrentlyReading, setIsCurrentlyReading] = useState(false);
  const [isFinishedReading, setIsFinishedReading] = useState(false);
  const [isUpdatingReadingStatus, setIsUpdatingReadingStatus] = useState(false);
  const [isUpdatingFinishedStatus, setIsUpdatingFinishedStatus] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    // Load reading status when component mounts
    if (db && auth) {
      loadReadingStatus();
      // Set up comments listener
      const unsubscribe = setupCommentsListener();
      return unsubscribe;
    }
  }, [book.id, user, db, auth]);

  const loadReadingStatus = async () => {
    if (!user) {
      // Fallback to AsyncStorage for non-authenticated users
      loadReadingStatusFromAsyncStorage();
      return;
    }

    try {
      // Check if book is in currently reading collection
      const currentlyReadingRef = doc(db, 'users', user.uid, 'currentlyReading', book.id);
      const currentlyReadingDoc = await getDoc(currentlyReadingRef);
      setIsCurrentlyReading(currentlyReadingDoc.exists());
      
      // Check if book is in read collection
      const readRef = doc(db, 'users', user.uid, 'finishedReading', book.id);
      const readDoc = await getDoc(readRef);
      setIsFinishedReading(readDoc.exists());
      
      // Load likes
      const likesRef = doc(db, 'bookLikes', book.id);
      const likesDoc = await getDoc(likesRef);
      
      if (likesDoc.exists()) {
        setLikes(likesDoc.data().count || 0);
      }
      
      // Check if user has liked this book
      const userLikedRef = doc(db, 'bookLikes', `${book.id}_${user.uid}`);
      const userLikedDoc = await getDoc(userLikedRef);
      if (userLikedDoc.exists()) {
        setHasLiked(userLikedDoc.data().liked);
      }
    } catch (error) {
      console.error('Error loading reading status:', error);
      // Fallback to AsyncStorage if Firebase query fails
      loadReadingStatusFromAsyncStorage();
    }
  };

  const loadReadingStatusFromAsyncStorage = async () => {
    try {
      // Check if book is in currently reading list
      const currentlyReadingList = await AsyncStorage.getItem('currentlyReadingBooks');
      if (currentlyReadingList) {
        const readingBooks = JSON.parse(currentlyReadingList);
        const isReading = readingBooks.some(item => item.id === book.id);
        setIsCurrentlyReading(isReading);
      }

      // Check if book is in finished reading list
      const readList = await AsyncStorage.getItem('readBooks');
      if (readList) {
        const finishedBooks = JSON.parse(readList);
        const isFinished = finishedBooks.some(item => item.id === book.id);
        setIsFinishedReading(isFinished);
      }

      // Load likes
      const bookLikes = await AsyncStorage.getItem(`book_likes_${book.id}`);
      if (bookLikes) {
        setLikes(parseInt(bookLikes));
      }

      const userLiked = await AsyncStorage.getItem(`user_liked_${book.id}`);
      if (userLiked === 'true') {
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error loading reading status from AsyncStorage:', error);
    }
  };

  const setupCommentsListener = () => {
    if (!db) return () => {};
    
    const q = query(
      collection(db, 'bookComments', book.id, 'comments'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setComments(snapshot.docs.map(doc => doc.data()));
      },
      (error) => {
        console.error('Error setting up comments listener:', error);
      }
    );

    // Return unsubscribe function to be called when component unmounts
    return unsubscribe;
  };

  const handleCurrentlyReading = async () => {
    if (!user) {
      Alert.alert(
        "Giriş Gerekli", 
        "Bu özelliği kullanmak için giriş yapmanız gerekiyor. Giriş yapmak ister misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel"
          },
          {
            text: "Giriş Yap", 
            onPress: () => navigation.navigate('Account')
          }
        ]
      );
      return;
    }

    if (isUpdatingReadingStatus || !db) return;
    
    setIsUpdatingReadingStatus(true);
    const currentlyReadingRef = doc(db, 'users', user.uid, 'currentlyReading', book.id);
    
    try {
      if (isCurrentlyReading) {
        // Remove from currently reading
        await deleteDoc(currentlyReadingRef);
        setIsCurrentlyReading(false);
        Alert.alert('Başarılı', 'Kitap "Halen Okunan Kitaplar" listesinden kaldırıldı');
      } else {
        // Add to currently reading collection
        const bookData = {
          id: book.id,
          title: volumeInfo.title,
          authors: volumeInfo.authors || [],
          thumbnail: volumeInfo.imageLinks?.thumbnail || '',
          description: volumeInfo.description || '',
          publisher: volumeInfo.publisher || '',
          publishedDate: volumeInfo.publishedDate || '',
          addedAt: new Date(),
          pageCount: volumeInfo.pageCount || 0,
          categories: volumeInfo.categories || [],
          language: volumeInfo.language || ''
        };
        
        await setDoc(currentlyReadingRef, bookData);
        setIsCurrentlyReading(true);
        Alert.alert('Başarılı', 'Kitap "Halen Okunan Kitaplar" listesine eklendi');
      }
    } catch (error) {
      console.error('Error updating reading status:', error);
      Alert.alert('Hata', 'Okuma durumu güncellenirken bir hata oluştu');
    } finally {
      setIsUpdatingReadingStatus(false);
    }
  };

  const handleFinishedReading = async () => {
    if (!user) {
      Alert.alert(
        "Giriş Gerekli", 
        "Bu özelliği kullanmak için giriş yapmanız gerekiyor. Giriş yapmak ister misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel"
          },
          {
            text: "Giriş Yap", 
            onPress: () => navigation.navigate('Account')
          }
        ]
      );
      return;
    }
    
    if (isUpdatingFinishedStatus || !db) return;
    
    setIsUpdatingFinishedStatus(true);
    const finishedRef = doc(db, 'users', user.uid, 'finishedReading', book.id);
    const currentlyReadingRef = doc(db, 'users', user.uid, 'currentlyReading', book.id);
    
    try {
      if (isFinishedReading) {
        // Remove from finished reading
        await deleteDoc(finishedRef);
        setIsFinishedReading(false);
        Alert.alert('Başarılı', 'Kitap "Okunan Kitaplar" listesinden kaldırıldı');
      } else {
        // Add to finished reading collection
        const bookData = {
          id: book.id,
          title: volumeInfo.title,
          authors: volumeInfo.authors || [],
          thumbnail: volumeInfo.imageLinks?.thumbnail || '',
          description: volumeInfo.description || '',
          publisher: volumeInfo.publisher || '',
          publishedDate: volumeInfo.publishedDate || '',
          finishedAt: new Date(),
          pageCount: volumeInfo.pageCount || 0,
          categories: volumeInfo.categories || [],
          language: volumeInfo.language || ''
        };
        
        await setDoc(finishedRef, bookData);
        setIsFinishedReading(true);
        Alert.alert('Başarılı', 'Kitap "Okunan Kitaplar" listesine eklendi');
        
        // If adding to finished reading, remove from currently reading if there
        if (isCurrentlyReading) {
          await deleteDoc(currentlyReadingRef);
          setIsCurrentlyReading(false);
        }
      }
    } catch (error) {
      console.error('Error updating finished reading status:', error);
      Alert.alert('Hata', 'Okuma durumu güncellenirken bir hata oluştu');
    } finally {
      setIsUpdatingFinishedStatus(false);
    }
  };

  const handleLikeBook = async () => {
    if (!user) {
      Alert.alert(
        "Giriş Gerekli", 
        "Bu özelliği kullanmak için giriş yapmanız gerekiyor. Giriş yapmak ister misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel"
          },
          {
            text: "Giriş Yap", 
            onPress: () => navigation.navigate('Account')
          }
        ]
      );
      return;
    }

    if (isLiking || !db) return;
    
    setIsLiking(true);
    const likesRef = doc(db, 'bookLikes', book.id);
    const userLikedRef = doc(db, 'bookLikes', `${book.id}_${user.uid}`);
    
    try {
      // First check if the user has already liked
      const userLikedDoc = await getDoc(userLikedRef);
      const currentLikeStatus = userLikedDoc.exists() ? userLikedDoc.data().liked : false;
      
      // Only proceed if the current status is different from what we want to set
      if (currentLikeStatus !== !hasLiked) {
        if (!hasLiked) {
          // Add like
          await setDoc(likesRef, { count: increment(1) }, { merge: true });
          await setDoc(userLikedRef, { liked: true });
          setLikes(prev => prev + 1);
          setHasLiked(true);
        } else {
          // Remove like
          await setDoc(likesRef, { count: increment(-1) }, { merge: true });
          await setDoc(userLikedRef, { liked: false });
          setLikes(prev => prev - 1);
          setHasLiked(false);
        }
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      Alert.alert('Hata', 'Beğeni durumu güncellenirken bir hata oluştu');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    if (!user) {
      Alert.alert(
        "Giriş Gerekli", 
        "Yorum yapmak için giriş yapmanız gerekiyor. Giriş yapmak ister misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel"
          },
          {
            text: "Giriş Yap", 
            onPress: () => navigation.navigate('Account')
          }
        ]
      );
      return;
    }

    if (!db) return;

    const now = new Date();
    try {
      await addDoc(collection(db, 'bookComments', book.id, 'comments'), {
        name: user.displayName || user.email || 'Anonim',
        text: comment.trim(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: now,
      });
      setComment('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Hata', 'Yorumunuz gönderilemedi');
    }
  };

  const handlePreviewLink = async () => {
    if (volumeInfo.previewLink) {
      try {
        await Linking.openURL(volumeInfo.previewLink);
      } catch (error) {
        Alert.alert('Hata', 'Link açılamadı');
      }
    }
  };

  const handleInfoLink = async () => {
    if (volumeInfo.infoLink) {
      try {
        await Linking.openURL(volumeInfo.infoLink);
      } catch (error) {
        Alert.alert('Hata', 'Link açılamadı');
      }
    }
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

          {/* Like and Favorites Buttons */}
          <View style={styles.actionButtonsRow}>
            <View style={styles.likeContainer}>
              <TouchableOpacity 
                onPress={handleLikeBook} 
                style={styles.likeButton}
                disabled={isLiking}
              >
                <Ionicons 
                  name={hasLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={hasLiked ? "#dc2626" : "#6b7280"} 
                />
              </TouchableOpacity>
              <Text style={styles.likeCount}>{likes} beğeni</Text>
            </View>

            {isAuthenticated && (
              <View style={styles.favoriteContainer}>
                <TouchableOpacity 
                  onPress={() => toggleFavorite(book)}
                  style={styles.favoriteButton}
                >
                  <Ionicons 
                    name={isFavorite(book.id) ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={isFavorite(book.id) ? "#8B2635" : "#6b7280"} 
                  />
                </TouchableOpacity>
                <Text style={styles.favoriteText}>
                  {isFavorite(book.id) ? 'Listemde' : 'Listeme Ekle'}
                </Text>
              </View>
            )}
          </View>

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
            
            {/* Reading Buttons - Moved here */}
            <TouchableOpacity 
              onPress={handleCurrentlyReading} 
              style={[
                styles.button,
                isCurrentlyReading ? styles.activeButton : styles.defaultReadingButton
              ]}
              disabled={isUpdatingReadingStatus}
            >
              <Text style={[
                styles.buttonText,
                isCurrentlyReading ? styles.activeButtonText : {}
              ]}>
                {isCurrentlyReading ? '📖 Okunuyor' : '📚 Okumaya Başla'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFinishedReading} 
              style={[
                styles.button,
                isFinishedReading ? styles.completedButton : styles.defaultReadingButton
              ]}
              disabled={isUpdatingFinishedStatus}
            >
              <Text style={[
                styles.buttonText,
                isFinishedReading ? styles.completedButtonText : {}
              ]}>
                {isFinishedReading ? '✅ Okundu' : '📚 Kitabı Tamamlama'}
              </Text>
            </TouchableOpacity>
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
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likeButton: {
    marginRight: 8,
  },
  likeCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: 8,
  },
  favoriteText: {
    fontSize: 14,
    color: '#6b7280',
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
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: '45%',
  },
  defaultReadingButton: {
    backgroundColor: '#9ca3af', // Medium gray for default reading buttons
  },
  activeButton: {
    backgroundColor: '#4b5563', // Darker gray for currently reading
  },
  completedButton: {
    backgroundColor: '#e8d5d8', // Light burgundy for completed
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
    color: '#ffffff', // White text for gray backgrounds
    fontWeight: '600',
    fontSize: 14,
  },
  activeButtonText: {
    color: '#ffffff', // White text for active button
    fontWeight: '600',
    fontSize: 14,
  },
  completedButtonText: {
    color: '#6b1d28', // Darker burgundy for completed text
    fontWeight: '600',
    fontSize: 14,
  },
  commentSection: {
    marginTop: 48,
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
