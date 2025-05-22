import React, { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { googleBooksService } from "../services/googleBooksService";
import colors from "../constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const categories = [
    {
      id: 1,
      name: 'Romance',
      icon: 'heart',
      books: [
        {
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          image: 'https://covers.openlibrary.org/b/id/8226191-L.jpg',
        },
        {
          title: 'The Notebook',
          author: 'Nicholas Sparks',
          image: 'https://covers.openlibrary.org/b/id/10041557-L.jpg',
        },
      ],
    },
    {
      id: 2,
      name: 'Science Fiction',
      icon: 'rocket',
      books: [
        {
          title: 'Dune',
          author: 'Frank Herbert',
          image: 'https://covers.openlibrary.org/b/id/8108696-L.jpg',
        },
        {
          title: 'Neuromancer',
          author: 'William Gibson',
          image: 'https://covers.openlibrary.org/b/id/8675320-L.jpg',
        },
      ],
    },
    {
      id: 3,
      name: 'Mystery',
      icon: 'search',
      books: [
        {
          title: 'Sherlock Holmes',
          author: 'Arthur Conan Doyle',
          image: 'https://covers.openlibrary.org/b/id/8231996-L.jpg',
        },
        {
          title: 'Gone Girl',
          author: 'Gillian Flynn',
          image: 'https://covers.openlibrary.org/b/id/8155431-L.jpg',
        },
      ],
    },
    {
      id: 4,
      name: 'Fantasy',
      icon: 'magic',
      books: [
        {
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          image: 'https://covers.openlibrary.org/b/id/7984916-L.jpg',
        },
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          image: 'https://covers.openlibrary.org/b/id/8100936-L.jpg',
        },
      ],
    },
    {
      id: 5,
      name: 'History',
      icon: 'book',
      books: [
        {
          title: 'Sapiens',
          author: 'Yuval Noah Harari',
          image: 'https://covers.openlibrary.org/b/id/8370223-L.jpg',
        },
        {
          title: 'The Diary of a Young Girl',
          author: 'Anne Frank',
          image: 'https://covers.openlibrary.org/b/id/8228781-L.jpg',
        },
      ],
    },
    {
      id: 6,
      name: 'Biography',
      icon: 'user',
      books: [
        {
          title: 'Steve Jobs',
          author: 'Walter Isaacson',
          image: 'https://covers.openlibrary.org/b/id/7352163-L.jpg',
        },
        {
          title: 'The Diary of Anne Frank',
          author: 'Anne Frank',
          image: 'https://covers.openlibrary.org/b/id/8228781-L.jpg',
        },
      ],
    },
    {
      id: 7,
      name: 'Dünya Klasikleri',
      icon: 'globe',
      books: [
        {
          title: 'Don Quixote',
          author: 'Miguel de Cervantes',
          image: 'https://covers.openlibrary.org/b/id/8439256-L.jpg',
        },
        {
          title: 'War and Peace',
          author: 'Leo Tolstoy',
          image: 'https://covers.openlibrary.org/b/id/8231998-L.jpg',
        },
      ],
    },
    {
      id: 8,
      name: '100 Temel Eser',
      icon: 'star',
      books: [
        {
          title: '1984',
          author: 'George Orwell',
          image: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          image: 'https://covers.openlibrary.org/b/id/8225264-L.jpg',
        },
      ],
    },
    {
      id: 9,
      name: 'Polisiye Romanları',
      icon: 'user-secret',
      books: [
        {
          title: 'The Girl with the Dragon Tattoo',
          author: 'Stieg Larsson',
          image: 'https://covers.openlibrary.org/b/id/8225630-L.jpg',
        },
        {
          title: 'The Silent Patient',
          author: 'Alex Michaelides',
          image: 'https://covers.openlibrary.org/b/id/10534377-L.jpg',
        },
      ],
    },
    {
      id: 10,
      name: 'Çocuk Kitapları',
      icon: 'child',
      books: [
        {
          title: "Charlotte's Web",
          author: 'E.B. White',
          image: 'https://covers.openlibrary.org/b/id/8235110-L.jpg',
        },
        {
          title: 'Matilda',
          author: 'Roald Dahl',
          image: 'https://covers.openlibrary.org/b/id/8091010-L.jpg',
        },
      ],
    },
    {
      id: 11,
      name: 'Dini Kitaplar',
      icon: 'book-open',
      books: [
        {
          title: 'The Bible',
          author: 'Various',
          image: 'https://covers.openlibrary.org/b/id/8232649-L.jpg',
        },
        {
          title: 'The Quran',
          author: 'Various',
          image: 'https://covers.openlibrary.org/b/id/8205260-L.jpg',
        },
      ],
    },
    {
      id: 12,
      name: 'Şiir Kitapları',
      icon: 'feather-alt',
      books: [
        {
          title: 'The Waste Land',
          author: 'T.S. Eliot',
          image: 'https://covers.openlibrary.org/b/id/7949003-L.jpg',
        },
        {
          title: 'The Raven',
          author: 'Edgar Allan Poe',
          image: 'https://covers.openlibrary.org/b/id/8231993-L.jpg',
        },
      ],
    },
    {
      id: 13,
      name: 'Gezi Kitapları',
      icon: 'map',
      books: [
        {
          title: 'Into the Wild',
          author: 'Jon Krakauer',
          image: 'https://covers.openlibrary.org/b/id/8091011-L.jpg',
        },
        {
          title: 'The Geography of Bliss',
          author: 'Eric Weiner',
          image: 'https://covers.openlibrary.org/b/id/8235870-L.jpg',
        },
      ],
    },
    {
      id: 14,
      name: 'Art Kitapları',
      icon: 'broom',
      books: [
        {
          title: 'Ways of Seeing',
          author: 'John Berger',
          image: 'https://covers.openlibrary.org/b/id/8235112-L.jpg',
        },
        {
          title: 'The Story of Art',
          author: 'E.H. Gombrich',
          image: 'https://covers.openlibrary.org/b/id/8235113-L.jpg',
        },
      ],
    },
  ];


  const Anasayfa = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      
      setIsLoading(true);
      try {
        const results = await googleBooksService.searchBooks(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const renderBookItem = ({ item }) => {
      const imageUrl = item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x220.png?text=Kapak+Yok';
      
      return (
        <TouchableOpacity
          style={styles.bookCard}
          onPress={() => navigation.navigate("BookDetail", { book: item })}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.bookImage}
            resizeMode="contain"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.volumeInfo.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.volumeInfo.authors?.join(", ") || "Unknown Author"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    };

    const renderSearchResults = () => {
      if (isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      }

      if (searchResults.length === 0 && searchQuery) {
        return (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No books found</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={searchResults}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.searchResultsContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    };

    return (
      <ScrollView style={styles.container}>
        {/* AI Book Recommendation Feature Promotion */}
        <TouchableOpacity 
          style={styles.aiFeatureCard}
          onPress={() => navigation.navigate('AIRecommendation')}
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
            <Ionicons name="laptop" size={48} color={colors.white} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {searchQuery ? (
          renderSearchResults()
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <View style={styles.bookList}>
                {category.books.map((book, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.card}
                    onPress={() => navigation.navigate("BookDetail", { book })}
                  >
                    <Image
                      source={{ uri: book.image }}
                      style={styles.bookImage}
                    />
                    <View style={styles.bookInfo}>
                      <Text style={styles.bookTitle}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };
  
  export default Anasayfa;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
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
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  aiFeatureSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    lineHeight: 20,
  },
  aiFeatureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  aiFeatureButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  aiFeatureIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#34495e",
  },
  bookList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "48%",
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  bookInfo: {
    padding: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchResultsContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  bookCard: {
    width: (Dimensions.get('window').width - 48) / 2, // 48 = padding (16) * 2 + gap (16)
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
});
