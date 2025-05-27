import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getFirebaseApp } from '../services/firebaseHelper';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firestore and Auth lazily
let db;
let auth;

const CurrentlyReadingScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.userData);
  const isAuthenticated = useSelector(state => !!state.auth.token);
  
  // User state
  const [user, setUser] = useState(null);

  // Renk paleti (anasayfadaki ile aynı)
  const categoryColors = [
    '#9147ff', // Purple
    '#b068e9', // Light Purple
    '#1e3a8a', // Navy
    '#b91c1c', // Red
    '#4f46e5', // Blue
    '#ec4899', // Pink
    '#7e22ce', // Deep Purple
    '#0ea5e9', // Light Blue
    '#7c3aed', // Violet
    '#059669', // Teal
    '#d946ef', // Magenta
    '#f59e0b', // Amber
  ];

  // Kitap ID'sine ve index'ine göre ardışık aynı renkler olmayacak şekilde renk belirleme
  const getRandomColor = (bookId, index, previousColor) => {
    // Kitap ID'sinin hash'ini hesapla
    let hash = 0;
    for (let i = 0; i < bookId.length; i++) {
      hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Index'i de hash'e ekle daha fazla çeşitlilik için
    hash += index * 37; // 37 asal sayı, daha iyi dağılım için
    
    // Hash'i pozitif yap
    hash = Math.abs(hash);
    
    // İlk rengi belirle
    let colorIndex = hash % categoryColors.length;
    let selectedColor = categoryColors[colorIndex];
    
    // Eğer önceki renkle aynı ise, farklı bir renk bul
    if (previousColor && selectedColor === previousColor) {
      // Farklı bir renk bulana kadar dene (maksimum 3 deneme)
      for (let attempt = 1; attempt < 4; attempt++) {
        colorIndex = (hash + attempt) % categoryColors.length;
        selectedColor = categoryColors[colorIndex];
        if (selectedColor !== previousColor) {
          break;
        }
      }
    }
    
    return selectedColor;
  };
  
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
      loadCurrentlyReadingBooks();
    }
  }, [authLoading, user, db]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!authLoading && db) {
        loadCurrentlyReadingBooks();
      }
    }, [user?.uid, db, authLoading])
  );

  const loadCurrentlyReadingBooks = async () => {
    try {
      setLoading(true);
      
      // If user is not authenticated, use local storage as fallback
      if (!user) {
        const localBooksString = await AsyncStorage.getItem('currentlyReadingBooks');
        if (localBooksString) {
          const localBooks = JSON.parse(localBooksString);
          setBooks(localBooks);
        } else {
          setBooks([]);
        }
        setLoading(false);
        return;
      }

      // Reference to the user's currently reading collection
      const readingRef = collection(db, 'users', user.uid, 'currentlyReading');
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        readingRef,
        (snapshot) => {
          const bookList = snapshot.docs.map(doc => ({ 
            id: doc.id,
            ...doc.data() 
          }));
          
          // Sort by added date, newest first
          bookList.sort((a, b) => {
            const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0);
            const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0);
            return dateB - dateA;
          });
          
          setBooks(bookList);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching currently reading books:', error);
          setLoading(false);
          Alert.alert('Hata', 'Kitaplar yüklenirken bir sorun oluştu.');
        }
      );
      
      // Return the unsubscribe function to clean up the listener when component unmounts
      return unsubscribe;
    } catch (error) {
      console.error('Error in loadCurrentlyReadingBooks:', error);
      setLoading(false);
      Alert.alert('Hata', 'Kitaplar yüklenirken bir sorun oluştu.');
    }
  };

  const handleRemoveFromReading = async (bookId) => {
    if (!user) {
      Alert.alert('Hata', 'Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'currentlyReading', bookId));
      Alert.alert('Başarılı', 'Kitap "Halen Okunan Kitaplar" listesinden kaldırıldı');
    } catch (error) {
      console.error('Error removing book from currently reading:', error);
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

  const renderBookItem = ({ item, index }) => {
    const coverUrl = item.thumbnail || 'https://via.placeholder.com/150x220.png?text=No+Cover';
    const authors = item.authors ? (Array.isArray(item.authors) ? item.authors.join(', ') : item.authors) : 'Bilinmeyen Yazar';
    const addedDate = item.addedAt ? new Date(item.addedAt).toLocaleDateString('tr-TR') : (
      item.addedDate ? new Date(item.addedDate).toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih'
    );

    // Önceki kitabın rengini al (ardışık aynı renk olmaması için)
    const previousColor = index > 0 ? getRandomColor(books[index - 1].id, index - 1) : null;
    
    // Kitap ID'sine ve index'ine göre rastgele renk al
    const cardColor = getRandomColor(item.id, index, previousColor);

    return (
      <TouchableOpacity 
        style={[styles.bookItem, { backgroundColor: cardColor }]}
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
            <Text style={styles.statusText}>📖 Okunuyor</Text>
            <Text style={styles.dateText}>Başlangıç: {addedDate}</Text>
          </View>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveFromReading(item.id)}
          >
            <Text style={styles.removeButtonText}>Okumayı Bitir</Text>
          </TouchableOpacity>
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
        <Text style={styles.emptyText}>Şu anda okuduğunuz kitap bulunmamaktadır.</Text>
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
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Kitaplar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}></Text>
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
    color: '#ffffff',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  readingStatus: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  removeButtonText: {
    color: '#ffffff',
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
    backgroundColor: '#10b981',
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

export default CurrentlyReadingScreen; 