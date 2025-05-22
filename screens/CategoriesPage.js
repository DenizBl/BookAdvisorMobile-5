import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categoriesData } from '../contexts/categoriesData';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = width / numColumns - 20;

export default function CategoriesPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            Kategoriler
            <Text style={styles.categoryCount}> {categoriesData.length} kategori</Text>
          </Text>
        </View>
        
        <View style={styles.gridContainer}>
          {categoriesData.map((category) => {
            const Icon = category.Icon;
            return (
              <TouchableOpacity
                key={category.slug}
                style={styles.categoryTile}
                onPress={() => navigation.navigate('CategoryDetail', { slug: category.slug })}
              >
                <Icon size={32} color="#EF4444" style={styles.icon} />
                <Text style={styles.categoryName}>{category.displayNameTR}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#DC2626',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#FEE2E2',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  categoryTile: {
    width: tileSize,
    height: tileSize,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
}); 