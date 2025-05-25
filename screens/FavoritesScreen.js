import React, { useState } from 'react';
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   Image,
   Alert,
   ActivityIndicator,
   Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSelector } from 'react-redux';
import colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

const FavoritesScreen = () => {
   const navigation = useNavigation();
   const { favorites, loading, commentCounts, removeFromFavorites } = useFavorites();
   const isAuthenticated = useSelector(state => !!state.auth.token);
   const [showRemoveModal, setShowRemoveModal] = useState(false);
   const [selectedBook, setSelectedBook] = useState(null);

   const handleRemoveFavorite = (book) => {
      setSelectedBook(book);
      setShowRemoveModal(true);
   };

   const confirmRemove = async () => {
      try {
         await removeFromFavorites(selectedBook.id);
         setShowRemoveModal(false);
         setSelectedBook(null);
      } catch (error) {
         setShowRemoveModal(false);
         Alert.alert('Hata', 'Kitap listenizden kaldırılırken bir sorun oluştu. Lütfen tekrar deneyin.');
      }
   };

   const cancelRemove = () => {
      setShowRemoveModal(false);
      setSelectedBook(null);
   };

   const renderFavoriteItem = ({ item }) => {
      const imageUrl = item.thumbnail || 'https://via.placeholder.com/150x220.png?text=Kapak+Yok';

      // Use the complete book data if available, otherwise fallback to reconstructed object
      const bookForNavigation = item.completeBookData || {
         id: item.id,
         volumeInfo: {
            title: item.title,
            authors: item.authors,
            description: item.description,
            imageLinks: { thumbnail: item.thumbnail },
            publishedDate: item.publishedDate,
         }
      };

      return (
         <View style={styles.bookCard}>
            <TouchableOpacity
               style={styles.bookContent}
               onPress={() => navigation.navigate('BookDetail', { 
                  book: bookForNavigation
               })}
            >
               <Image
                  source={{ uri: imageUrl }}
                  style={styles.bookImage}
                  resizeMode="contain"
               />
               <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                     {item.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                     {item.authors?.join(', ') || 'Bilinmeyen Yazar'}
                  </Text>
                  <Text style={styles.bookDescription} numberOfLines={3}>
                     {item.description || 'Açıklama mevcut değil'}
                  </Text>
               </View>
            </TouchableOpacity>
            
            <View style={styles.buttonContainer}>
               <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(item)}
               >
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                  <Text style={styles.removeButtonText}>Listemden Kaldır</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => navigation.navigate('BookDetail', { 
                     book: bookForNavigation
                  })}
               >
                  <Ionicons name="chatbubble-outline" size={16} color="#718096" />
                  <Text style={styles.commentButtonText}>
                     {commentCounts[item.id] || 0} Yorum
                  </Text>
               </TouchableOpacity>
            </View>
         </View>
      );
   };

   const renderEmptyState = () => (
      <View style={styles.emptyContainer}>
         <Ionicons name="heart-outline" size={80} color="#cbd5e0" />
         <Text style={styles.emptyTitle}>
            {!isAuthenticated ? 'Giriş yapmanız gerekiyor' : 'Listeniz henüz boş'}
         </Text>
         <Text style={styles.emptySubtitle}>
            {!isAuthenticated 
               ? 'Listenizi görmek için lütfen giriş yapın'
               : 'Beğendiğiniz kitapları listenize ekleyerek burada görüntüleyebilirsiniz'
            }
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
            <Text style={styles.loadingText}>Listeniz yükleniyor...</Text>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
               favorites.length === 0 ? styles.emptyListContainer : styles.listContainer
            }
            ListEmptyComponent={renderEmptyState}
         />

         {/* Custom Remove Modal */}
         <Modal
            visible={showRemoveModal}
            transparent={true}
            animationType="fade"
            onRequestClose={cancelRemove}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                     <View style={styles.modalIconContainer}>
                        <Ionicons name="bookmark-outline" size={32} color={colors.primary} />
                     </View>
                     <Text style={styles.modalTitle}>Listeden Kaldır</Text>
                  </View>
                  
                  <View style={styles.modalContent}>
                     <Text style={styles.modalMessage}>
                        <Text style={styles.bookTitleInModal}>"{selectedBook?.title}"</Text>
                        {'\n'}adlı kitabı listenizden kaldırmak istediğinizden emin misiniz?
                     </Text>
                     <Text style={styles.modalSubMessage}>
                        Bu işlem geri alınamaz ve kitap favoriler listenizden tamamen kaldırılacaktır.
                     </Text>
                  </View>

                  <View style={styles.modalButtons}>
                     <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelRemove}
                     >
                        <Text style={styles.cancelButtonText}>Vazgeç</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={confirmRemove}
                     >
                        <Ionicons name="trash-outline" size={16} color="white" />
                        <Text style={styles.confirmButtonText}>Kaldır</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </Modal>
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
   listContainer: {
      padding: 16,
   },
   emptyListContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   bookCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
   },
   bookContent: {
      padding: 16,
      flexDirection: 'row',
   },
   bookImage: {
      width: 80,
      height: 120,
      borderRadius: 8,
      marginRight: 16,
   },
   bookInfo: {
      flex: 1,
      justifyContent: 'flex-start',
   },
   bookTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: 4,
   },
   bookAuthor: {
      fontSize: 14,
      color: '#718096',
      marginBottom: 8,
   },
   bookDescription: {
      fontSize: 12,
      color: '#a0aec0',
      lineHeight: 18,
   },
   buttonContainer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
   },
   removeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: '#fef2f2',
      borderBottomLeftRadius: 12,
   },
   removeButtonText: {
      marginLeft: 6,
      fontSize: 12,
      color: '#e74c3c',
      fontWeight: '500',
   },
   commentButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: '#f7fafc',
      borderBottomRightRadius: 12,
   },
   commentButtonText: {
      marginLeft: 6,
      fontSize: 12,
      color: '#718096',
      fontWeight: '500',
   },
   emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
   },
   emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d3748',
      marginTop: 20,
      marginBottom: 8,
      textAlign: 'center',
   },
   emptySubtitle: {
      fontSize: 14,
      color: '#718096',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 30,
   },
   exploreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
   },
   exploreButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 12,
      width: '80%',
      maxWidth: 400,
   },
   modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
   },
   modalIconContainer: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d3748',
   },
   modalContent: {
      marginBottom: 16,
   },
   modalMessage: {
      fontSize: 14,
      color: '#718096',
      textAlign: 'center',
      lineHeight: 20,
   },
   bookTitleInModal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2d3748',
   },
   modalSubMessage: {
      fontSize: 12,
      color: '#718096',
      textAlign: 'center',
      lineHeight: 18,
   },
   modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
   },
   cancelButton: {
      flex: 1,
      padding: 12,
      backgroundColor: '#f7fafc',
      borderRadius: 8,
      alignItems: 'center',
   },
   cancelButtonText: {
      fontSize: 14,
      color: '#718096',
      fontWeight: '500',
   },
   confirmButton: {
      flex: 1,
      padding: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
   },
   confirmButtonText: {
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 6,
   },
});

export default FavoritesScreen;
