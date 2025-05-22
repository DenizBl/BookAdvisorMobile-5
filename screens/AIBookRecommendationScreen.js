import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AIBookRecommendation from '../components/AIBookRecommendation';

const AIBookRecommendationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AIBookRecommendation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E1',
  },
});

export default AIBookRecommendationScreen; 