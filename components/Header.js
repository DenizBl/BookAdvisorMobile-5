import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, Search } from 'lucide-react-native';

export default function Header() {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}
      >
        <Menu size={24} color="#1F2937" />
      </TouchableOpacity>
      
      <Text style={styles.title}>BookAdvisor</Text>
      
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Search size={24} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
}); 