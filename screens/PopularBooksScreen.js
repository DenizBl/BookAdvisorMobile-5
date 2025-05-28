import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   Image,
   TouchableOpacity,
   ActivityIndicator,
   Alert,
   RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirebaseApp } from '../services/firebaseHelper';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { googleBooksService } from '../services/googleBooksService';
import colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import BookRecommendationModal from '../components/BookRecommendationModal';

// Initialize Firestore
let db;

const PopularBooksScreen = () => {
   const navigation = useNavigation();
   const { isFavorite, toggleFavorite } = useFavorites();
   const isAuthenticated = useSelector((state) => !!state.auth.token);
   const [likedBooks, setLikedBooks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);

   useEffect(() => {
      const app = getFirebaseApp();
      db = getFirestore(app);
      fetchLikedBooks();
   }, []);

   // Refresh when screen comes into focus
   useFocusEffect(
      React.useCallback(() => {
         if (db) {
            fetchLikedBooks();
         }
      }, [db])
   );

   const fetchLikedBooks = async () => {
      try {
         setLoading(true);

         // Get all book likes
         const likesRef = collection(db, 'bookLikes');
         const likesSnapshot = await getDocs(likesRef);

         // Filter out user-specific likes and get only the book likes
         const bookLikes = likesSnapshot.docs
            .filter((doc) => !doc.id.includes('_')) // Exclude user-specific likes
            .map((doc) => ({
               id: doc.id,
               likes: doc.data().count || 0,
            }))
            .sort((a, b) => b.likes - a.likes); // Sort by number of likes

         // Fetch book details for each liked book
         const booksWithDetails = await Promise.all(
            bookLikes.map(async (book) => {
               try {
                  const bookDetails = await googleBooksService.getBookById(book.id);
                  return {
                     ...bookDetails,
                     likes: book.likes,
                  };
               } catch (error) {
                  console.error(`Error fetching book ${book.id}:`, error);
                  return null;
               }
            })
         );

         // Filter out any null values and set the state
         setLikedBooks(booksWithDetails.filter((book) => book !== null));
      } catch (error) {
         console.error('Error fetching liked books:', error);
         Alert.alert('Hata', 'Popüler kitaplar yüklenirken bir sorun oluştu.');
      } finally {
         setLoading(false);
      }
   };

   const renderBookItem = ({ item }) => {
      const imageUrl =
         item.volumeInfo.imageLinks?.thumbnail ||
         'https://via.placeholder.com/150x220.png?text=Kapak+Yok';

      return (
         <TouchableOpacity
            style={styles.bookCard}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
         >
            <View style={styles.bookImageContainer}>
               <Image
                  source={{ uri: imageUrl }}
                  style={styles.bookImage}
                  resizeMode="cover"
               />
               {isAuthenticated && (
                  <TouchableOpacity
                     style={styles.favoriteButton}
                     onPress={() => toggleFavorite(item)}
                  >
                     <Ionicons
                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite(item.id) ? '#e74c3c' : '#ffffff'}
                     />
                  </TouchableOpacity>
               )}
            </View>

            <View style={styles.bookInfo}>
               <Text style={styles.bookTitle} numberOfLines={2}>
                  {item.volumeInfo.title}
               </Text>
               <Text style={styles.bookAuthor} numberOfLines={1}>
                  {item.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
               </Text>

               {/* Likes Count */}
               <View style={styles.likesContainer}>
                  <Ionicons name="heart" size={16} color="#e74c3c" />
                  <Text style={styles.likesText}>{item.likes} Beğeni</Text>
               </View>

               {/* Additional Details */}
               <View style={styles.detailsContainer}>
                  {item.volumeInfo.publishedDate && (
                     <Text style={styles.detailText}>
                        Yayın: {new Date(item.volumeInfo.publishedDate).getFullYear()}
                     </Text>
                  )}
                  {item.volumeInfo.pageCount && (
                     <Text style={styles.detailText}>
                        {item.volumeInfo.pageCount} sayfa
                     </Text>
                  )}
                  {item.volumeInfo.categories && (
                     <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>
                           {item.volumeInfo.categories[0]}
                        </Text>
                     </View>
                  )}
               </View>
            </View>
         </TouchableOpacity>
      );
   };

   const renderEmptyComponent = () => (
      <View style={styles.emptyContainer}>
         <Ionicons name="heart-outline" size={80} color="#cbd5e0" />
         <Text style={styles.emptyTitle}>Henüz popüler kitap yok</Text>
         <Text style={styles.emptySubtitle}>
            Kitapları beğenmeye başladığınızda burada görünecekler
         </Text>
         <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Anasayfa')}
         >
            <Text style={styles.exploreButtonText}>Kitapları Keşfet</Text>
         </TouchableOpacity>
      </View>
   );

   if (loading) {
      return (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Popüler kitaplar yükleniyor...</Text>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <View>
            <Text style={styles.headerSubtitle}>{likedBooks.length} kitap</Text>
         </View>

         <FlatList
            data={likedBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={likedBooks.length > 0 ? styles.row : null}
            contentContainerStyle={
               likedBooks.length === 0 ? styles.emptyListContainer : styles.listContainer
            }
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl refreshing={loading} onRefresh={fetchLikedBooks} />
            }
         />
         <BookRecommendationModal
            visible={recommendationModalVisible}
            onClose={() => setRecommendationModalVisible(false)}
         />
         <TouchableOpacity
            style={styles.fab}
            onPress={() => setRecommendationModalVisible(true)}
         >
            <LottieView
               source={{
                  uri: 'https://assets9.lottiefiles.com/packages/lf20_1pxqjqps.json',
               }}
               autoPlay
               loop
               style={styles.fabAnimation}
               resizeMode="contain"
            />
         </TouchableOpacity>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f5f6fa',
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f6fa',
   },
   loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#718096',
   },
   header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 4,
   },
   headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
   },
   listContainer: {
      padding: 16,
   },
   emptyListContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   row: {
      justifyContent: 'space-between',
      paddingHorizontal: 4,
   },
   bookCard: {
      width: '48%',
      backgroundColor: 'white',
      borderRadius: 12,
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: 'hidden',
   },
   bookImageContainer: {
      position: 'relative',
      height: 180,
   },
   bookImage: {
      width: '100%',
      height: '100%',
   },
   favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 6,
      borderRadius: 15,
   },
   bookInfo: {
      padding: 12,
   },
   bookTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 4,
      lineHeight: 18,
   },
   bookAuthor: {
      fontSize: 12,
      color: '#4a5568',
      marginBottom: 8,
   },
   likesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
   },
   likesText: {
      fontSize: 12,
      color: '#e74c3c',
      marginLeft: 4,
      fontWeight: '500',
   },
   detailsContainer: {
      marginBottom: 12,
   },
   detailText: {
      fontSize: 11,
      color: '#718096',
      marginBottom: 2,
   },
   categoryTag: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 4,
   },
   categoryTagText: {
      fontSize: 10,
      color: 'white',
      fontWeight: '600',
   },
   emptyContainer: {
      alignItems: 'center',
      paddingTop: 60,
   },
   emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d3748',
      marginTop: 16,
      marginBottom: 8,
   },
   emptySubtitle: {
      fontSize: 14,
      color: '#718096',
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
   },
   exploreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
   },
   exploreButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
   },
   fab: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      width: 110,
      height: 110,
      borderRadius: 55,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      overflow: 'visible',
   },
   fabAnimation: {
      width: 110,
      height: 110,
   },
});

export default PopularBooksScreen;