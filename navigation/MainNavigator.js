import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import MyCardScreen from '../screens/MyCardScreen';

import FavoritesScreen from '../screens/FavoritesScreen';
import AccountScreen from '../screens/AccountScreen';
import TaskScreen from '../screens/TaskScreen';
import Anasayfa from '../screens/Anasayfa';
import CategoriesScreen from '../screens/CategoriesScreen';
import BooksByCategoryScreen from '../screens/BooksByCategoryScreen';
import BookScreen from '../screens/BookScreen';
import BookDetail from '../screens/BookDetail';
import AIBookRecommendationScreen from '../screens/AIBookRecommendationScreen';
import CurrentlyReadingScreen from '../screens/CurrentlyReadingScreen';
import ReadBooksScreen from '../screens/ReadBooksScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = (props) => {
   return (
      <Tab.Navigator
         initialRouteName="Anasayfa"
         component={Anasayfa}
         screenOptions={{
            headerTitle: '',
            headerShadowVisible: false,
         }}
      >
         <Tab.Screen
            name="Anasayfa"
            component={Anasayfa}
            options={{
               headerShown: false,
               tabBarIcon: ({ color, size }) => {
                  return <FontAwesome5 name="book" size={size} color={color} />;
               },
            }}
         />
         <Tab.Screen
            name="AIRecommendation"
            component={AIBookRecommendationScreen}
            options={{
               headerShown: false,
               tabBarLabel: 'Yapay Zeka',
               tabBarIcon: ({ color, size }) => {
                  return <FontAwesome5 name="brain" size={size} color={color} />;
               },
            }}
         />
         <Tab.Screen
            name="Categories"
            component={CategoriesScreen}
            options={{
               headerShown: false,
               tabBarLabel: 'Categories',
               tabBarIcon: ({ color, size }) => {
                  return (
                     <MaterialCommunityIcons
                        name="menu"
                        size={size}
                        color={color}
                     />
                  );
                  // return <FontAwesome6 name="table-columns" size={24} color={colors.blue} />;
               },
            }}
         />
         <Tab.Screen
            name="CurrentlyReading"
            component={CurrentlyReadingScreen}
            options={{
               headerShown: false,
               tabBarLabel: 'Okunuyor',
               tabBarIcon: ({ color, size }) => {
                  return <Ionicons name="book-outline" size={size} color={color} />;
               },
            }}
         />
         <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
               tabBarIcon: ({ color, size }) => {
                  return <Ionicons name="heart" size={size} color={color} />;
               },
            }}
         />
         <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
               tabBarIcon: ({ color, size }) => {
                  return (
                     <Ionicons name="person-circle-outline" size={size} color={color} />
                  );
               },
            }}
         />
      </Tab.Navigator>
   );
};

const MainNavigator = (props) => {
   return (
      <Stack.Navigator>
         <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false }}
         />
         <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Kategoriler' }} />
         <Stack.Screen name="BooksByCategory" component={BooksByCategoryScreen} options={{ title: 'Kitaplar' }} />
         <Stack.Screen
            name="TasksScreen"
            component={TaskScreen}
            options={{
               headerShown: false,
            }}
         />
         <Stack.Screen
         name="BookScreen"
         component={BookScreen}
         options={{
         headerTitle: 'Kitaplar',
   }}
/>
<Stack.Screen
         name="BookDetail"
         component={BookDetail}
         options={{
         headerTitle: 'Kitaplar',
   }}
/>
         <Stack.Screen
            name="AIRecommendation"
            component={AIBookRecommendationScreen}
            options={{
               headerTitle: 'Yapay Zeka Kitap Önerisi',
            }}
         />
         <Stack.Screen
            name="CurrentlyReading"
            component={CurrentlyReadingScreen}
            options={{
               headerTitle: 'Okuduğum Kitaplar',
            }}
         />
         <Stack.Screen
            name="ReadBooks"
            component={ReadBooksScreen}
            options={{
               headerTitle: 'Okunan Kitaplar',
            }}
         />
         <Stack.Screen
            name="MyCard"
            component={MyCardScreen}
            options={{
               headerTitle: 'Card',
            }}
         />
      </Stack.Navigator>
   );
};

export default MainNavigator;
