import React from 'react';
import { View, Text, TouchableOpacity, ScrollView ,StyleSheet} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';




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

  
//export default function Categories() {
  //return (
    //<ScrollView contentContainerStyle={styles.categoryGrid}>
      //{categories.map(category => (
        //<TouchableOpacity key={category.id} style={styles.categoryCard}>
          //<FontAwesome5 name={category.icon} style={styles.categoryIcon} />
          //<Text style={styles.categoryTitle}>{category.name}</Text>
        //</TouchableOpacity>
      //))}
    //</ScrollView>
  //);
//}

export default function Categories({ navigation }) {  // navigation prop'u alındı
    return (
      <ScrollView contentContainerStyle={styles.categoryGrid}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('BookScreen', { categoryName: category.name, books: category.books })}
          >
            <FontAwesome5 name={category.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryTitle}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }
  





const styles= StyleSheet.create({
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  categoryCard: {
    flexBasis: '45%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    margin: 8,
    borderColor: '#C2B280',
    borderWidth: 1,
    borderBottomWidth: 4,
    borderBottomColor: '#8B2635', // Burgundy
  },
  categoryIcon: {
    fontSize: 45,
    color: '#4A3C31', // Dark Brown
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3C31',
  },
});

