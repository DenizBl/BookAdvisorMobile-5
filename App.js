import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './apps/store';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { getFirebaseApp } from './services/firebaseHelper.js';
import { FavoritesProvider } from './contexts/FavoritesContext';

//AsyncStorage.clear();

export default function App() {
   useEffect(() => {
      console.log('useEffect çalıştı!');
      getFirebaseApp();
   }, []);

   return (
      <Provider store={store}>
         <SafeAreaProvider>
            <FavoritesProvider>
               <StatusBar style="auto" />
               <AppNavigator />
            </FavoritesProvider>
         </SafeAreaProvider>
      </Provider>
   );
}

// const styles = StyleSheet.create({
//    container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//    },
// });
