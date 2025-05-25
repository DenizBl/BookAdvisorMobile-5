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
   FlatList,
   Dimensions,
   Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { googleBooksService } from '../services/googleBooksService';
import colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import BookRecommendationModal from '../components/BookRecommendationModal';
import { categoriesData } from '../components/categoriesData';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSelector } from 'react-redux';
import { getFirebaseApp } from '../services/firebaseHelper';
import { getFirestore, doc, setDoc, getDoc, increment, collection, query, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firestore and Auth
let db;
let auth;

const Anasayfa = () => {
   const navigation = useNavigation();
   const { isFavorite, toggleFavorite } = useFavorites();
   const isAuthenticated = useSelector(state => !!state.auth.token);
   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);
   const [categoryBooks, setCategoryBooks] = useState({});
   const [loadingCategories, setLoadingCategories] = useState(true);
   const [user, setUser] = useState(null);
   const [bookLikes, setBookLikes] = useState({});
   const [userLikedBooks, setUserLikedBooks] = useState({});
   const [bookComments, setBookComments] = useState({});

   useEffect(() => {
      const app = getFirebaseApp();
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Setup auth state listener
      const unsubscribe = auth.onAuthStateChanged(currentUser => {
         setUser(currentUser);
      });
      
      loadCategoryBooks();
      testGoogleBooksAPI();
      
      return unsubscribe;
   }, []);

   // Clear search results when search query is cleared
   useEffect(() => {
      if (!searchQuery.trim()) {
         setSearchResults([]);
      }
   }, [searchQuery]);

   // Load likes for search results
   useEffect(() => {
      if (searchResults.length > 0 && user && db) {
         loadLikesForBooks(searchResults);
      }
   }, [searchResults, user]);

   // Load likes and comments for category books
   useEffect(() => {
      if (Object.keys(categoryBooks).length > 0 && db) {
         const allBooks = Object.values(categoryBooks).flat();
         if (allBooks.length > 0) {
            loadLikesForBooks(allBooks);
            loadCommentsForBooks(allBooks);
         }
      }
   }, [categoryBooks, user]);

   const testGoogleBooksAPI = async () => {
      try {
         const response = await fetch(
            'https://www.googleapis.com/books/v1/volumes?q=bilim&langRestrict=tr&maxResults=10'
         );
         const data = await response.json();
      } catch (error) {
         console.error('API Test Error:', error);
      }
   };

   const loadCategoryBooks = async () => {
      setLoadingCategories(true);
      try {
         const booksByCategory = {};
         for (const category of categoriesData.slice(0, 6)) {
            const response = await fetch(
               `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
                  category.name
               )}&langRestrict=tr&maxResults=4`
            );
            const data = await response.json();
            const books = data.items || [];
            booksByCategory[category.name] = books;
         }
         setCategoryBooks(booksByCategory);
      } catch (error) {
         console.error('Error loading category books:', error);
      } finally {
         setLoadingCategories(false);
      }
   };

   const loadLikesForBooks = async (books) => {
      if (!db || !user) return;
      
      try {
         const likesData = {};
         const userLikesData = {};
         
         for (const book of books) {
            // Load book likes count
            const likesRef = doc(db, 'bookLikes', book.id);
            const likesDoc = await getDoc(likesRef);
            likesData[book.id] = likesDoc.exists() ? likesDoc.data().count || 0 : 0;
            
            // Load user's like status
            const userLikedRef = doc(db, 'bookLikes', `${book.id}_${user.uid}`);
            const userLikedDoc = await getDoc(userLikedRef);
            userLikesData[book.id] = userLikedDoc.exists() ? userLikedDoc.data().liked : false;
         }
         
         setBookLikes(likesData);
         setUserLikedBooks(userLikesData);
      } catch (error) {
         console.error('Error loading likes:', error);
      }
   };

   const loadCommentsForBooks = async (books) => {
      if (!db) return;
      
      try {
         const commentsData = {};
         
         for (const book of books) {
            try {
               // Load book comments count from subcollection
               const commentsRef = collection(db, 'bookComments', book.id, 'comments');
               const q = query(commentsRef);
               const querySnapshot = await getDocs(q);
               commentsData[book.id] = querySnapshot.size;
            } catch (error) {
               console.error('Error fetching comment count for book:', book.id, error);
               commentsData[book.id] = 0;
            }
         }
         
         setBookComments(commentsData);
      } catch (error) {
         console.error('Error loading comments:', error);
      }
   };

   const handleLikeBook = async (book) => {
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

      if (!db) return;
      
      try {
         const likesRef = doc(db, 'bookLikes', book.id);
         const userLikedRef = doc(db, 'bookLikes', `${book.id}_${user.uid}`);
         
         const currentLikeStatus = userLikedBooks[book.id] || false;
         
         if (!currentLikeStatus) {
            // Add like
            await setDoc(likesRef, { count: increment(1) }, { merge: true });
            await setDoc(userLikedRef, { liked: true });
            
            // Update local state
            setBookLikes(prev => ({
               ...prev,
               [book.id]: (prev[book.id] || 0) + 1
            }));
            setUserLikedBooks(prev => ({
               ...prev,
               [book.id]: true
            }));
            
            // Also add to favorites
            toggleFavorite(book);
         } else {
            // Remove like
            await setDoc(likesRef, { count: increment(-1) }, { merge: true });
            await setDoc(userLikedRef, { liked: false });
            
            // Update local state
            setBookLikes(prev => ({
               ...prev,
               [book.id]: Math.max((prev[book.id] || 0) - 1, 0)
            }));
            setUserLikedBooks(prev => ({
               ...prev,
               [book.id]: false
            }));
            
            // Also remove from favorites
            toggleFavorite(book);
         }
      } catch (error) {
         console.error('Error updating like status:', error);
         Alert.alert('Hata', 'Beğeni durumu güncellenirken bir hata oluştu');
      }
   };

   const handleSearch = async () => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      try {
         const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
               searchQuery
            )}&langRestrict=tr&maxResults=20`
         );
         const data = await response.json();
         const turkishResults = data.items || [];

         if (turkishResults.length < 5) {
            const allResponse = await fetch(
               `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                  searchQuery
               )}&maxResults=20`
            );
            const allData = await allResponse.json();
            const allResults = allData.items || [];
            const combinedResults = [
               ...turkishResults,
               ...allResults.filter(
                  (book) => !turkishResults.some((t) => t.id === book.id)
               ),
            ];
            setSearchResults(combinedResults);
         } else {
            setSearchResults(turkishResults);
         }
      } catch (error) {
         console.error('Search error:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const renderBookItem = ({ item }) => {
      const imageUrl =
         item.volumeInfo.imageLinks?.thumbnail ||
         'https://via.placeholder.com/150x220.png?text=Kapak+Yok';

      const likeCount = bookLikes[item.id] || 0;
      const commentCount = bookComments[item.id] || 0;

      return (
         <TouchableOpacity
            style={styles.bookCard}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
         >
            <View style={styles.bookImageContainer}>
               <Image
                  source={{ uri: imageUrl }}
                  style={styles.bookImage}
                  resizeMode="contain"
               />
               {isAuthenticated && (
                  <TouchableOpacity
                     style={styles.favoriteButton}
                     onPress={() => toggleFavorite(item)}
                  >
                     <Ionicons
                        name={isFavorite(item.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite(item.id) ? "#e74c3c" : "#718096"}
                     />
                  </TouchableOpacity>
               )}
            </View>
            <View style={styles.bookInfo}>
               <View style={styles.bookTextInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                     {item.volumeInfo.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                     {item.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                  </Text>
               </View>
               
               {/* Like and Comment Counts */}
               <View style={styles.bookStats}>
                  <View style={styles.statItem}>
                     <Ionicons name="heart" size={12} color="#e74c3c" />
                     <Text style={styles.statText}>{likeCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                     <Ionicons name="chatbubble" size={12} color="#718096" />
                     <Text style={styles.statText}>{commentCount}</Text>
                  </View>
               </View>
            </View>
         </TouchableOpacity>
      );
   };

   const renderSearchBookItem = ({ item }) => {
      const imageUrl =
         item.volumeInfo.imageLinks?.thumbnail ||
         'https://via.placeholder.com/150x220.png?text=Kapak+Yok';

      const isLiked = userLikedBooks[item.id] || false;
      const likeCount = bookLikes[item.id] || 0;

      return (
         <TouchableOpacity
            style={styles.searchBookCard}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
         >
            <View style={styles.searchBookImageContainer}>
               <Image
                  source={{ uri: imageUrl }}
                  style={styles.searchBookImage}
                  resizeMode="cover"
               />
               {isAuthenticated && (
                  <TouchableOpacity
                     style={styles.searchFavoriteButton}
                     onPress={() => handleLikeBook(item)}
                  >
                     <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={isLiked ? "#e74c3c" : "#ffffff"}
                     />
                  </TouchableOpacity>
               )}
            </View>
            <View style={styles.searchBookInfo}>
               <Text style={styles.searchBookTitle} numberOfLines={2}>
                  {item.volumeInfo.title}
               </Text>
               <Text style={styles.searchBookAuthor} numberOfLines={1}>
                  {item.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
               </Text>
               <View style={styles.searchBookMeta}>
                  {item.volumeInfo.publishedDate && (
                     <Text style={styles.searchBookYear}>
                        {new Date(item.volumeInfo.publishedDate).getFullYear()}
                     </Text>
                  )}
                  {item.volumeInfo.averageRating && (
                     <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#fbbf24" />
                        <Text style={styles.ratingText}>
                           {item.volumeInfo.averageRating.toFixed(1)}
                        </Text>
                     </View>
                  )}
               </View>
               {item.volumeInfo.description && (
                  <Text style={styles.searchBookDescription} numberOfLines={2}>
                     {item.volumeInfo.description.replace(/<[^>]*>/g, '')}
                  </Text>
               )}
               {item.volumeInfo.categories && (
                  <View style={styles.categoryTag}>
                     <Text style={styles.categoryTagText}>
                        {item.volumeInfo.categories[0]}
                     </Text>
                  </View>
               )}
               {/* Likes Display */}
               {likeCount > 0 && (
                  <View style={styles.likesDisplay}>
                     <Ionicons name="heart" size={14} color="#e74c3c" />
                     <Text style={styles.likesDisplayText}>
                        {likeCount} beğeni
                     </Text>
                  </View>
               )}
               {isAuthenticated && (
                  <TouchableOpacity
                     style={[
                        styles.favoriteActionButton,
                        isLiked && styles.favoriteActionButtonActive
                     ]}
                     onPress={() => handleLikeBook(item)}
                  >
                     <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={16}
                        color={isLiked ? "#ffffff" : colors.primary}
                     />
                     <Text style={[
                        styles.favoriteActionButtonText,
                        isLiked && styles.favoriteActionButtonTextActive
                     ]}>
                        {isLiked ? "Listemde" : "Listeme Ekle"}
                     </Text>
                  </TouchableOpacity>
               )}
            </View>
         </TouchableOpacity>
      );
   };

   const renderCategorySection = (category) => {
      const books = categoryBooks[category.name] || [];

      return (
         <View style={styles.categorySection} key={category.name}>
            <View style={styles.categoryHeader}>
               <Text style={styles.categoryTitle}>{category.displayNameTR}</Text>
               <TouchableOpacity
                  onPress={() =>
                     navigation.navigate('BooksByCategory', {
                        category: category.name,
                        displayName: category.displayNameTR,
                     })
                  }
               >
                  <Text style={styles.seeAllText}>Tümünü Gör</Text>
               </TouchableOpacity>
            </View>
            {loadingCategories ? (
               <ActivityIndicator size="small" color={colors.primary} />
            ) : (
               <FlatList
                  data={books}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryBooksList}
               />
            )}
         </View>
      );
   };

   return (
      <ScrollView style={styles.container}>
         {/* AI Book Recommendation Feature Promotion */}
         <TouchableOpacity
            style={styles.aiFeatureCard}
            onPress={() => setRecommendationModalVisible(true)}
         >
            <View style={styles.aiFeatureTextContainer}>
               <Text style={styles.aiFeatureTitle}>Kitap Tavsiyesi</Text>
               <Text style={styles.aiFeatureSubtitle}>
                  Ruh halinize göre özel kitap önerileri alın!
               </Text>
               <View style={styles.aiFeatureButton}>
                  <Text style={styles.aiFeatureButtonText}>Şimdi Dene</Text>
               </View>
            </View>
            <View style={styles.aiFeatureIconContainer}>
               <FontAwesome5 name="robot" size={48} color={colors.white} />
            </View>
         </TouchableOpacity>

         {/* Book Recommendation Modal */}
         <BookRecommendationModal
            visible={recommendationModalVisible}
            onClose={() => setRecommendationModalVisible(false)}
         />

         <View style={styles.searchContainer}>
            <TextInput
               style={styles.searchInput}
               placeholder="Kitap ara..."
               value={searchQuery}
               onChangeText={setSearchQuery}
               onSubmitEditing={handleSearch}
               returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
               <Text style={styles.searchButtonText}>Ara</Text>
            </TouchableOpacity>
         </View>

         {isLoading ? (
            <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={colors.primary} />
            </View>
         ) : searchResults.length > 0 ? (
            <View style={styles.searchResultsContainer}>
               <Text style={styles.searchResultsTitle}>Arama Sonuçları</Text>
               <FlatList
                  data={searchResults}
                  renderItem={renderSearchBookItem}
                  keyExtractor={(item) => item.id}
                  numColumns={1}
                  contentContainerStyle={styles.searchResultsList}
                  showsVerticalScrollIndicator={false}
               />
            </View>
         ) : (
            <View style={styles.categoriesContainer}>
               {categoriesData.slice(0, 6).map(renderCategorySection)}
            </View>
         )}
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f5f6fa',
      paddingHorizontal: 16,
      paddingTop: 20,
   },
   aiFeatureCard: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginTop: 10,
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.white,
   },
   aiFeatureTextContainer: {
      flex: 3,
   },
   aiFeatureTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 4,
   },
   aiFeatureSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 12,
      lineHeight: 20,
   },
   aiFeatureButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)',
   },
   aiFeatureButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
   },
   aiFeatureIconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   },
   searchContainer: {
      flexDirection: 'row',
      marginBottom: 20,
   },
   searchInput: {
      flex: 1,
      height: 40,
      backgroundColor: 'white',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#e2e8f0',
   },
   searchButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
   },
   searchButtonText: {
      color: 'white',
      fontWeight: 'bold',
   },
   categorySection: {
      marginBottom: 24,
   },
   categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
   },
   categoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d3748',
   },
   seeAllText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
   },
   categoryBooksList: {
      paddingRight: 16,
   },
   bookCard: {
      width: 120,
      marginRight: 12,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
   },
   bookImageContainer: {
      position: 'relative',
   },
   bookImage: {
      width: '100%',
      height: 160,
      borderRadius: 4,
      marginBottom: 8,
   },
   favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 4,
      borderRadius: 12,
   },
   bookInfo: {
      flex: 1,
      justifyContent: 'space-between',
   },
   bookTextInfo: {
      flex: 1,
   },
   bookTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#2d3748',
      marginBottom: 4,
   },
   bookAuthor: {
      fontSize: 12,
      color: '#718096',
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   searchResultsContainer: {
      flex: 1,
   },
   searchResultsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: 16,
   },
   searchResultsList: {
      paddingBottom: 20,
   },
   row: {
      justifyContent: 'space-between',
      paddingHorizontal: 8,
   },
   categoriesContainer: {
      flex: 1,
   },
   searchBookCard: {
      width: '100%',
      marginBottom: 16,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: 'row',
      alignItems: 'flex-start',
   },
   searchBookImageContainer: {
      position: 'relative',
      marginRight: 12,
   },
   searchBookImage: {
      width: 80,
      height: 120,
      borderRadius: 8,
   },
   searchFavoriteButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 6,
      borderRadius: 15,
   },
   searchBookInfo: {
      flex: 1,
      paddingTop: 4,
   },
   searchBookTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 6,
      lineHeight: 20,
   },
   searchBookAuthor: {
      fontSize: 14,
      color: '#4a5568',
      marginBottom: 4,
      fontWeight: '500',
   },
   searchBookYear: {
      fontSize: 12,
      color: '#718096',
      marginRight: 8,
   },
   ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   ratingText: {
      fontSize: 12,
      color: '#4a5568',
      marginLeft: 3,
      fontWeight: '500',
   },
   searchBookMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
   },
   searchBookDescription: {
      fontSize: 13,
      color: '#718096',
      lineHeight: 18,
      marginBottom: 8,
   },
   categoryTag: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
   },
   categoryTagText: {
      fontSize: 11,
      color: 'white',
      fontWeight: '600',
   },
   favoriteActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 8,
      alignSelf: 'flex-start',
   },
   favoriteActionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   favoriteActionButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
   },
   favoriteActionButtonTextActive: {
      color: 'white',
   },
   likesDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
   },
   likesDisplayText: {
      fontSize: 12,
      color: '#718096',
      marginLeft: 4,
   },
   bookStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
   },
   statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
   },
   statText: {
      fontSize: 12,
      color: '#718096',
      marginLeft: 2,
   },
});

export default Anasayfa;