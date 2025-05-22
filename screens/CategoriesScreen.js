import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import {categoriesData} from '../components/categoriesData';
import { useNavigation } from '@react-navigation/native';

const CategoriesScreen = () => {
  const navigation = useNavigation();

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate('BooksByCategory', {
          category: item.name,
          displayName: item.displayNameTR,
        })
      }
    >
      <Text style={styles.categoryText}>{item.displayNameTR}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kategoriler</Text>
      <FlatList
        data={categoriesData}
        keyExtractor={(item) => item.slug}
        renderItem={renderCategoryItem}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#b91c1c' },
  list: { paddingBottom: 24 },
  categoryCard: {
    flex: 1,
    backgroundColor: '#ffe4e6',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f1d1d',
  },
});

export default CategoriesScreen;

