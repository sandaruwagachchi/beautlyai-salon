import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/home/CustomerHomeScreen';
import LoyaltyScreen from '../screens/home/LoyaltyScreen';
import UpcomingAppointmentsScreen from '../screens/home/UpcomingAppointmentsScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import DateTimeSelectionScreen from '../screens/booking/DateTimeSelectionScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import HistoryScreen from '../screens/profile/HistoryScreen';
import PreferencesScreen from '../screens/profile/PreferencesScreen';
import LogoutHeaderButton from './LogoutHeaderButton';
import type {
  BookingStackParamList,
  HomeStackParamList,
  NotificationStackParamList,
  ProfileStackParamList,
} from './types';

export type CustomerTabParamList = {
  Home: undefined;
  Booking: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const NotificationStack = createNativeStackNavigator<NotificationStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <HomeStack.Screen name="Dashboard" component={CustomerHomeScreen} options={{ title: 'Dashboard' }} />
      <HomeStack.Screen name="Loyalty" component={LoyaltyScreen} options={{ title: 'Loyalty rewards' }} />
      <HomeStack.Screen
        name="UpcomingAppointments"
        component={UpcomingAppointmentsScreen}
        options={{ title: 'Upcoming appointments' }}
      />
    </HomeStack.Navigator>
  );
};

const BookingNavigator: React.FC = () => {
  return (
    <BookingStack.Navigator
      initialRouteName="ServiceSelection"
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <BookingStack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{ title: 'Select service' }}
      />
      <BookingStack.Screen
        name="DateTimeSelection"
        component={DateTimeSelectionScreen}
        options={{ title: 'Date & Time' }}
      />
      <BookingStack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{ title: 'Confirm booking' }}
      />
    </BookingStack.Navigator>
  );
};

const NotificationsNavigator: React.FC = () => {
  return (
    <NotificationStack.Navigator
      initialRouteName="NotificationCenter"
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <NotificationStack.Screen
        name="NotificationCenter"
        component={NotificationCenterScreen}
        options={{ title: 'Notification Centre' }}
      />
    </NotificationStack.Navigator>
  );
};

const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
      }}
    >
      <ProfileStack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
      <ProfileStack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <ProfileStack.Screen name="Preferences" component={PreferencesScreen} options={{ title: 'Preferences' }} />
    </ProfileStack.Navigator>
  );
};

const CustomerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6C4FB2',
        tabBarInactiveTintColor: '#8D857D',
        tabBarStyle: {
          backgroundColor: '#FCFAF7',
          borderTopColor: '#E9DED1',
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home'
              ? 'home-outline'
              : route.name === 'Booking'
                ? 'cut-outline'
                : route.name === 'Notifications'
                  ? 'notifications-outline'
                  : 'person-outline';

          return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Booking" component={BookingNavigator} options={{ title: 'Booking' }} />
      <Tab.Screen name="Notifications" component={NotificationsNavigator} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;
