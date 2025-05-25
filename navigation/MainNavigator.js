import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Anasayfa from '../screens/Anasayfa';
import CategoriesScreen from '../screens/CategoriesScreen';
import CurrentlyReadingScreen from '../screens/CurrentlyReadingScreen';
import ReadBooksScreen from '../screens/ReadBooksScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AccountScreen from '../screens/AccountScreen';
import AIBookRecommendationScreen from '../screens/AIBookRecommendationScreen';
import BooksByCategoryScreen from '../screens/BooksByCategoryScreen';
import BookScreen from '../screens/BookScreen';
import BookDetail from '../screens/BookDetail';
import PopularBooksScreen from '../screens/PopularBooksScreen';
import MyCardScreen from '../screens/MyCardScreen';
import TaskScreen from '../screens/TaskScreen';
import { logout } from '../apps/store/authSlice';
import { userLogout } from '../utils/actions/authActions';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator - Ana tab bar
const MainTabNavigator = ({ navigation }) => {
   return (
      <Tab.Navigator
         initialRouteName="Anasayfa"
         screenOptions={{
            headerShown: true,
            headerStyle: {
               backgroundColor: colors.primary,
               paddingHorizontal: 16,
               paddingTop: 20,
               paddingBottom: 16,
               borderBottomLeftRadius: 12,
               borderBottomRightRadius: 12,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
            headerLeft: () => (
               <TouchableOpacity
                  onPress={() => navigation.openDrawer()}
                  style={{ marginLeft: 10 }}
               >
                  <Ionicons name="menu" size={24} color="#fff" />
               </TouchableOpacity>
            ),
            tabBarStyle: {
               backgroundColor: '#fff',
               borderTopWidth: 1,
               borderTopColor: '#e9ecef',
               height: 60,
               paddingBottom: 5,
               paddingTop: 5,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: '#8e8e93',
         }}
      >
         <Tab.Screen
            name="Anasayfa"
            component={AnasayfaStack}
            options={{
               title: 'Ana Sayfa',
               tabBarLabel: 'Ana Sayfa',
               tabBarIcon: ({ color, size, focused }) => (
                  <FontAwesome5 
                     name="book" 
                     size={size} 
                     color={focused ? colors.primary : '#8e8e93'} 
                  />
               ),
            }}
         />
         <Tab.Screen
            name="Categories"
            component={CategoriesStack}
            options={{
               title: 'Kategoriler',
               tabBarLabel: 'Kategoriler',
               tabBarIcon: ({ color, size, focused }) => (
                  <MaterialCommunityIcons 
                     name="menu" 
                     size={size} 
                     color={focused ? colors.primary : '#8e8e93'} 
                  />
               ),
            }}
         />
         <Tab.Screen
            name="CurrentlyReading"
            component={CurrentlyReadingStack}
            options={{
               title: 'Şu Anda Okuduklarım',
               tabBarLabel: 'Okunuyor',
               tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons 
                     name="book-outline" 
                     size={size} 
                     color={focused ? colors.primary : '#8e8e93'} 
                  />
               ),
            }}
         />
         <Tab.Screen
            name="ReadBooks"
            component={ReadBooksStack}
            options={{
               title: 'Okuduklarım',
               tabBarLabel: 'Okundu',
               tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons 
                     name="book" 
                     size={size} 
                     color={focused ? colors.primary : '#8e8e93'} 
                  />
               ),
            }}
         />
         <Tab.Screen
            name="Favorites"
            component={FavoritesStack}
            options={{
               title: 'Listem',
               tabBarLabel: 'Listem',
               tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons 
                     name="bookmark" 
                     size={size} 
                     color={focused ? colors.primary : '#8e8e93'} 
                  />
               ),
            }}
         />
      </Tab.Navigator>
   );
};

// Stack navigators for each main screen
const AnasayfaStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="AnasayfaMain" 
         component={Anasayfa} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BooksByCategory" 
         component={BooksByCategoryScreen} 
         options={{ 
            headerShown: true,
            title: 'Kitaplar',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
      <Stack.Screen 
         name="BookScreen" 
         component={BookScreen} 
         options={{ 
            headerShown: true,
            title: 'Kitaplar',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ 
            headerShown: true,
            title: 'Kitap Detayı',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
   </Stack.Navigator>
);

const CategoriesStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="CategoriesMain" 
         component={CategoriesScreen} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BooksByCategory" 
         component={BooksByCategoryScreen} 
         options={{ 
            headerShown: true,
            title: 'Kitaplar',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ 
            headerShown: true,
            title: 'Kitap Detayı',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
   </Stack.Navigator>
);

const CurrentlyReadingStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="CurrentlyReadingMain" 
         component={CurrentlyReadingScreen} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ 
            headerShown: true,
            title: 'Kitap Detayı',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
   </Stack.Navigator>
);

const ReadBooksStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="ReadBooksMain" 
         component={ReadBooksScreen} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ 
            headerShown: true,
            title: 'Kitap Detayı',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
   </Stack.Navigator>
);

const FavoritesStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="FavoritesMain" 
         component={FavoritesScreen} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ 
            headerShown: true,
            title: 'Kitap Detayı',
            headerStyle: {
               backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
         }} 
      />
   </Stack.Navigator>
);

// AI Recommendation Stack
const AIRecommendationStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="AIRecommendationMain" 
         component={AIBookRecommendationScreen} 
         options={{ headerShown: false }} 
      />
   </Stack.Navigator>
);

// Popular Books Stack
const PopularBooksStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="PopularBooksMain" 
         component={PopularBooksScreen} 
         options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="BookDetail" 
         component={BookDetail} 
         options={{ title: 'Kitap Detayı' }} 
      />
   </Stack.Navigator>
);

// Account Stack
const AccountStack = () => (
   <Stack.Navigator>
      <Stack.Screen 
         name="AccountMain" 
         component={AccountScreen} 
         options={{ headerShown: false }} 
      />
   </Stack.Navigator>
);

const CustomDrawerContent = (props) => {
   const dispatch = useDispatch();
   const userData = useSelector((state) => state.auth.userData);

   const handleLogout = () => {
      console.log('Logout button pressed');
      dispatch(userLogout());
      console.log('UserLogout action dispatched');
   };

   const navigateToScreen = (screenName) => {
      props.navigation.navigate(screenName);
      props.navigation.closeDrawer();
   };

   return (
      <View style={styles.drawerContainer}>
         <View style={styles.drawerHeader}>
            {userData?.profilePicture ? (
               <Image
                  source={{ uri: userData.profilePicture }}
                  style={styles.userImage}
               />
            ) : (
               <View style={styles.defaultUserIcon}>
                  <Ionicons name="person-circle" size={60} color="#fff" />
               </View>
            )}
            <Text style={styles.userName}>
               {userData?.name || userData?.firstName || 'Kullanıcı'}
            </Text>
            <Text style={styles.userEmail}>
               {userData?.email || 'email@example.com'}
            </Text>
         </View>

         <View style={styles.drawerItems}>
            <TouchableOpacity
               style={styles.drawerItem}
               onPress={() => navigateToScreen('MainTabs')}
            >
               <FontAwesome5 name="home" size={20} color={colors.primary} />
               <Text style={styles.drawerItemText}>Ana Sayfa</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={styles.drawerItem}
               onPress={() => navigateToScreen('AIRecommendation')}
            >
               <Ionicons name="bulb" size={20} color={colors.primary} />
               <Text style={styles.drawerItemText}>AI Kitap Önerisi</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={styles.drawerItem}
               onPress={() => navigateToScreen('PopularBooks')}
            >
               <Ionicons name="star" size={20} color={colors.primary} />
               <Text style={styles.drawerItemText}>Popüler Kitaplar</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={styles.drawerItem}
               onPress={() => navigateToScreen('Account')}
            >
               <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
               <Text style={styles.drawerItemText}>Hesabım</Text>
            </TouchableOpacity>
         </View>

         <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
               <Ionicons name="log-out" size={20} color={colors.primary} />
               <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
         </View>
      </View>
   );
};

const DrawerNavigator = () => {
   return (
      <Drawer.Navigator
         drawerContent={(props) => <CustomDrawerContent {...props} />}
         screenOptions={{
            headerStyle: {
               backgroundColor: colors.primary,
               paddingHorizontal: 16,
               paddingTop: 20,
               paddingBottom: 16,
               borderBottomLeftRadius: 12,
               borderBottomRightRadius: 12,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
               fontWeight: 'bold',
            },
            drawerStyle: {
               backgroundColor: '#f8f9fa',
               width: 280,
            },
         }}
      >
         <Drawer.Screen
            name="MainTabs"
            options={{
               headerShown: false,
               title: 'BookAdvisor',
               drawerIcon: ({ color, size }) => (
                  <FontAwesome5 name="home" size={size} color={color} />
               ),
            }}
         >
            {(props) => <MainTabNavigator {...props} />}
         </Drawer.Screen>
         <Drawer.Screen
            name="AIRecommendation"
            component={AIRecommendationStack}
            options={{
               title: 'AI Kitap Önerisi',
               drawerIcon: ({ color, size }) => (
                  <Ionicons name="bulb" size={size} color={color} />
               ),
            }}
         />
         <Drawer.Screen
            name="PopularBooks"
            component={PopularBooksStack}
            options={{
               title: 'Popüler Kitaplar',
               drawerIcon: ({ color, size }) => (
                  <Ionicons name="star" size={size} color={color} />
               ),
            }}
         />
         <Drawer.Screen
            name="Account"
            component={AccountStack}
            options={{
               title: 'Hesabım',
               drawerIcon: ({ color, size }) => (
                  <Ionicons name="person-circle-outline" size={size} color={color} />
               ),
            }}
         />
      </Drawer.Navigator>
   );
};

const MainNavigator = (props) => {
   return (
      <Stack.Navigator>
         <Stack.Screen
            name="DrawerHome"
            component={DrawerNavigator}
            options={{ headerShown: false }}
         />
         <Stack.Screen 
            name="BooksByCategory" 
            component={BooksByCategoryScreen} 
            options={{ title: 'Kitaplar' }} 
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
               headerTitle: 'Kitap Detayı',
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

const styles = StyleSheet.create({
   drawerContainer: {
      flex: 1,
      backgroundColor: '#f8f9fa',
   },
   drawerHeader: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 50,
      alignItems: 'center',
   },
   userImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: 10,
   },
   userName: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
   },
   userEmail: {
      color: '#fff',
      fontSize: 14,
      opacity: 0.8,
      marginTop: 5,
   },
   drawerItems: {
      flex: 1,
      paddingTop: 20,
   },
   drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
   },
   drawerItemText: {
      marginLeft: 15,
      fontSize: 16,
      color: '#333',
   },
   drawerFooter: {
      borderTopWidth: 1,
      borderTopColor: '#e9ecef',
      padding: 20,
   },
   logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   logoutText: {
      marginLeft: 15,
      fontSize: 16,
      color: colors.primary,
      fontWeight: 'bold',
   },
   defaultUserIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
   },
});

export default MainNavigator;
