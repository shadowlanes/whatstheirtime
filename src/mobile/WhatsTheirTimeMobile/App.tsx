import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import FriendListScreen from './screens/FriendListScreen';
import FriendDetailScreen from './screens/FriendDetailScreen';
import CitySearchScreen from './screens/CitySearchScreen';
import { City } from './models/CityData';
import { Friend } from './models/Friend';

export type RootStackParamList = {
  FriendList: undefined;
  FriendDetail: { friendId: string };
  CitySearch: { 
    onSelect: (city: City) => void;
    friendId?: string;
    friendName?: string;
    friendNotes?: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="FriendList" 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="FriendList" 
          component={FriendListScreen} 
          options={{ title: "What's Their Time" }}
        />
        <Stack.Screen 
          name="FriendDetail" 
          component={FriendDetailScreen} 
          options={({ route }) => ({ title: "Time Details" })}
        />
        <Stack.Screen 
          name="CitySearch" 
          component={CitySearchScreen} 
          options={{ title: "Select Location" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
