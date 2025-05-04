import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import MyCardScreen from '../screens/MyCardScreen';
import BoardScreen from '../screens/BoardScreen';
import SearchScreen from '../screens/SearchScreen';
import Notifications from '../screens/NotificationsScreen';
import AccountScreen from '../screens/AccountScreen';
import TaskScreen from '../screens/TaskScreen';
import JoinBoardScreen from '../screens/JoinBoardScreen';
import Anasayfa from '../screens/Anasayfa';
import Categories from '../screens/Categories';
import BookScreen from '../screens/BookScreen';
import BookDetail from '../screens/BookDetail';

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
            name="Categories"
            component={Categories}
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
            name="BookSearch"
            component={JoinBoardScreen}
            options={{
               headerShown: false,
               tabBarIcon: ({ color, size }) => {
                  return <FontAwesome5 name="search" size={size} color={color} />;
               },
            }}
         />
         <Tab.Screen
            name="Notifications"
            component={Notifications}
            options={{
               tabBarIcon: ({ color, size }) => {
                  return <Ionicons name="notifications" size={size} color={color} />;
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
