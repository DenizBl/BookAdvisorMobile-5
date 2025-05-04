import React from "react";
import {

  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

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
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>📚 Book Advisor</Text>
        {categories.map((category) => (
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
        ))}
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
});
