import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { googleBooksService } from '../services/googleBooksService';
import { useNavigation } from '@react-navigation/native';

const BooksByCategoryScreen = ({ route }) => {
  const { category, displayName } = route.params;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    googleBooksService.getBooksByCategory(category, '')
      .then((data) => {
        console.log(`Fetched ${data?.length || 0} books for category: ${category}`);
        setBooks(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching books:', err);
        setError(true);
        setLoading(false);
      });
  }, [category]);

  const getBookCoverUrl = (volumeInfo) => {
    if (!volumeInfo || !volumeInfo.imageLinks) {
      return 'https://via.placeholder.com/150x220.png?text=No+Cover';
    }
    
    // Try different image options in order of preference
    const imageUrl = 
      volumeInfo.imageLinks.thumbnail ||
      volumeInfo.imageLinks.smallThumbnail ||
      volumeInfo.imageLinks.small ||
      'https://via.placeholder.com/150x220.png?text=No+Cover';
    
    // Ensure HTTPS (Google Books sometimes returns HTTP URLs)
    return imageUrl.replace(/^http:\/\//i, 'https://');
  };

  const renderBookItem = ({ item }) => {
    if (!item || !item.volumeInfo) {
      return null;
    }
    
    const volumeInfo = item.volumeInfo;
    const imageLink = getBookCoverUrl(volumeInfo);
    const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmeyen Yazar';

    return (
      <TouchableOpacity 
        style={styles.bookItem}
        onPress={() => navigation.navigate('BookDetail', { book: item })}
      >
        <View style={styles.bookContent}>
          <View style={styles.coverContainer}>
            <Image 
              source={{ uri: imageLink }} 
              style={styles.coverImage} 
              resizeMode="cover"
            />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.bookTitle} numberOfLines={2}>{volumeInfo.title || 'Başlıksız Kitap'}</Text>
            <Text style={styles.authorName} numberOfLines={1}>{authors}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Bu kategoride kitap bulunamadı.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayName} Kitapları</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#b91c1c" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bir hata oluştu. Lütfen tekrar deneyin.</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderBookItem}
          contentContainerStyle={[
            styles.list,
            books.length === 0 && styles.emptyList
          ]}
          numColumns={2}
          columnWrapperStyle={books.length > 0 ? styles.columnWrapper : null}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    color: '#991b1b' 
  },
  list: { 
    paddingBottom: 24, 
  },
  emptyList: {
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  bookItem: {
    backgroundColor: '#fee2e2',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    width: '48%',
  },
  bookContent: {
    flexDirection: 'column',
    padding: 12,
    alignItems: 'center',
  },
  coverContainer: {
    width: 100,
    height: 140,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    width: '100%',
    alignItems: 'center',
  },
  bookTitle: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#7f1d1d',
    marginBottom: 4,
    textAlign: 'center',
  },
  authorName: {
    fontSize: 12,
    color: '#991b1b',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#991b1b',
    textAlign: 'center',
  }
});

export default BooksByCategoryScreen;
