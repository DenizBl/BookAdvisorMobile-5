


import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BookScreen = ({ route }) => {
  const { books } = route.params;
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.image }} style={styles.coverImage} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default BookScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9F7F1',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  coverImage: {
    width: 100,
    height: 150,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3C31',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#555',
  },
});
