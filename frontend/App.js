import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentHistoryScreen from './src/screens/PaymentHistoryScreen';
import { theme } from './src/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Loan Details' }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{ title: 'Make Payment' }}
          />
          <Stack.Screen 
            name="PaymentHistory" 
            component={PaymentHistoryScreen}
            options={{ title: 'Payment History' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

