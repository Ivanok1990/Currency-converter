import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { initDatabase } from './db';
import ConverterScreen from './screens/ConverterScreen';
import HistoryScreen from './screens/HistoryScreen';
import { View, Text, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeApp();
  }, []);

  if (!dbInitialized) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Initializing database...</Text>
        </View>
    );
  }

  return (
      <NavigationContainer>
        <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Converter') {
                  iconName = 'compare-arrows';
                } else if (route.name === 'History') {
                  iconName = 'history';
                }
                return <MaterialIcons name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: '#4a90e2',
              inactiveTintColor: 'gray',
            }}
        >
          <Tab.Screen name="Converter" component={ConverterScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
        </Tab.Navigator>
      </NavigationContainer>
  );
}