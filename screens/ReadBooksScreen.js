import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { getFirebaseApp } from '../services/firebaseHelper';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firestore and Auth lazily
let db;
let auth;

const ReadBooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.userData);
  const isAuthenticated = useSelector(state => !!state.auth.token);
  
  // User state
  const [user, setUser] = useState(null);
  
  // Initialize Firebase services
  useEffect(() => {
    const app = getFirebaseApp();
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Setup auth state listener
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setAuthLoading(false); // Auth state is now determined
    });
    
    return unsubscribe;
  }, []);

  // Load books when auth state is determined
  useEffect(() => {
    if (!authLoading && db) {
      loadReadBooks();
    }
  }, [authLoading, user, db]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!authLoading && db) {
        loadReadBooks();
      }
    }, [user?.uid, db, authLoading])
  );

  const loadReadBooks = async () => {
    try {
      setLoading(true);
      
      // If user is not authenticated, use local storage as fallback
      if (!user) {
        const readList = await AsyncStorage.getItem('readBooks');
        if (readList) {
          const finishedBooks = JSON.parse(readList);
          // Sort by finished date, newest first
          finishedBooks.sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate));
          setBooks(finishedBooks);
        } else {
          setBooks([]);
        }
        setLoading(false);
        return;
      }

      // Reference to the user's read books collection
      const readBooksRef = collection(db, 'users', user.uid, 'finishedReading');
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        readBooksRef,
        (snapshot) => {
          const bookList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by finished date, newest first
          bookList.sort((a, b) => {
            const dateA = a.finishedAt ? new Date(a.finishedAt) : new Date(0);
            const dateB = b.finishedAt ? new Date(b.finishedAt) : new Date(0);
            return dateB - dateA;
          });
          
          setBooks(bookList);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching read books:', error);
          setLoading(false);
          Alert.alert('Hata', 'Kitaplar yüklenirken bir sorun oluştu.');
        }
      );
      
      // Return the unsubscribe function to clean up the listener when component unmounts
      return unsubscribe;
    } catch (error) {
      console.error('Error loading read books:', error);
      setLoading(false);
      Alert.alert('Hata', 'Kitaplar yüklenirken bir sorun oluştu.');
    }
  };

  const handleRemoveFromRead = async (bookId) => {
    if (!user) {
      Alert.alert('Hata', 'Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'finishedReading', bookId));
      Alert.alert('Başarılı', 'Kitap okunan kitaplar listesinden kaldırıldı');
    } catch (error) {
      console.error('Error removing book from read books:', error);
      Alert.alert('Hata', 'Kitap kaldırılırken bir hata oluştu');
    }
  };

  const handleBookPress = (book) => {
    // Navigate to book detail with the book data
    navigation.navigate('BookDetail', { 
      book: {
        id: book.id,
        volumeInfo: {
          title: book.title,
          authors: book.authors,
          imageLinks: { thumbnail: book.thumbnail },
          description: book.description,
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          pageCount: book.pageCount,
          categories: book.categories,
          language: book.language
        }
      } 
    });
  };

  const renderBookItem = ({ item }) => {
    const coverUrl = item.thumbnail || item.imageLinks?.thumbnail || 'https://via.placeholder.com/150x220.png?text=No+Cover';
    const authors = item.authors ? (Array.isArray(item.authors) ? item.authors.join(', ') : item.authors) : 'Bilinmeyen Yazar';
    const finishedDate = item.finishedAt ? new Date(item.finishedAt).toLocaleDateString('tr-TR') : (
      item.finishedDate ? new Date(item.finishedDate).toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih'
    );

    return (
      <TouchableOpacity 
        style={styles.bookItem}
        onPress={() => handleBookPress(item)}
      >
        <Image 
          source={{ uri: coverUrl }} 
          style={styles.coverImage} 
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>{authors}</Text>
          <View style={styles.readingStatus}>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={styles.statusText}>Okundu</Text>
            </View>
            <Text style={styles.dateText}>Tamamlanma: {finishedDate}</Text>
          </View>
          {isAuthenticated && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveFromRead(item.id)}
            >
              <Text style={styles.removeButtonText}>Listeden Kaldır</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bu özelliği kullanmak için giriş yapmanız gerekiyor.</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Account')}
          >
            <Text style={styles.browseButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz okuduğunuz kitap bulunmamaktadır.</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Anasayfa')}
        >
          <Text style={styles.browseButtonText}>Kitapları Keşfet</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Kitaplar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Okuduğum Kitaplar</Text>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={renderBookItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={books.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  readingStatus: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  }
});

export default ReadBooksScreen; 