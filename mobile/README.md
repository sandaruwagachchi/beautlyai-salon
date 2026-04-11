# BeautlyAI React Native Mobile App
## Multi-Role Salon Management Application

> React Native | TypeScript | React Native Paper | Zustand

---

## 🚀 Quick Start

```bash
cd mobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API endpoint

# Run on device/emulator
npm run android    # Android Emulator
npm run ios        # iOS Simulator (macOS only)
npm run web        # Web browser (testing)

# EAS Build (physical devices)
eas build --platform ios
eas build --platform android
```

---

## 📱 App Structure

### Screens by Role

```
App (RootNavigator)
├── AuthNavigator
│   └── LoginScreen
│
├── CustomerNavigator (Tab Navigation)
│   ├── Home
│   ├── Bookings
│   └── Profile
│
├── StaffNavigator (Tab Navigation)
│   ├── Home
│   ├── Schedule
│   ├── Clients
│   └── Profile
│
├── OwnerNavigator (Tab Navigation)
│   ├── Home
│   ├── Analytics
│   ├── Staff Management
│   └── Settings
│
└── AdminNavigator (Tab Navigation)
    ├── Home
    ├── User Management
    ├── Salon Management
    ├── Reports
    └── Settings
```

---

## 🏗️ Architecture

### Services (API & Business Logic)

**api.ts** - Centralized HTTP client
- Axios instance with interceptors
- Automatic JWT injection
- Error handling & token refresh

**auth.ts** - Authentication service
- Login/logout
- Token management
- Role-based access

**notification.ts** - Push notifications
- Register device token
- Listen for notifications
- Handle notification taps

### Store (Global State with Zustand)

**authStore.ts** - Authentication state
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**bookingStore.ts** - Booking state
```typescript
{
  bookings: Booking[],
  selectedBooking: Booking | null,
  isLoading: boolean
}
```

### Navigation (React Navigation)

Conditional navigation based on:
1. Authentication status
2. User role (CUSTOMER | STAFF | OWNER | ADMIN)
3. Loading state

Tab navigators for each role with appropriate screens.

---

## 🎨 UI Components (React Native Paper)

### Core Libraries

```json
{
  "react-native": "0.73+",
  "react-native-paper": "5.x",
  "react-navigation/native": "6.x",
  "react-navigation/bottom-tabs": "6.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "expo-notifications": "^0.20+",
  "expo-secure-store": "^12.x"
}
```

### Paper Components Used

```typescript
// Buttons
<Button mode="contained">Save</Button>
<Button mode="outlined">Cancel</Button>
<Button mode="text">Learn More</Button>

// Text Input
<TextInput label="Email" />
<TextInput label="Password" secureTextEntry />

// Lists
<List.Item title="Item" left={props => <List.Icon {...props} icon="folder" />} />

// Cards
<Card>
  <Card.Content>
    <Text>Booking Details</Text>
  </Card.Content>
</Card>

// Modals
<Modal visible={visible} onDismiss={onDismiss}>
  <Surface style={styles.container}>...</Surface>
</Modal>

// Snackbar (Notifications)
<Snackbar visible={visible} onDismiss={onDismiss}>
  Booking created successfully!
</Snackbar>

// Theme
export const theme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac4',
  },
};
```

---

## 🔐 Authentication Flow

### Login Process

```typescript
// 1. User enters credentials
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// 2. Call auth service
const response = await authService.login({
  email,
  password
});

// 3. Store in Zustand + SecureStore
useAuthStore.setState({
  user: response.user,
  token: response.token,
  isAuthenticated: true
});

// 4. Token persisted securely
SecureStore.setItemAsync('jwt_token', response.token);

// 5. Navigation changes based on role
{isAuthenticated ? <RoleNavigator /> : <AuthNavigator />}
```

### Token Management

```typescript
// Auto-inject token in requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear and redirect to login
      await SecureStore.deleteItemAsync('jwt_token');
      navigation.replace('Login');
    }
    return Promise.reject(error);
  }
);
```

---

## 🔔 Push Notifications

### Setup

```typescript
// 1. Register for notifications (on app start)
import notificationService from './services/notification';

useEffect(() => {
  const token = notificationService.registerPushNotifications();
  notificationService.setNotificationHandler();
  
  notificationService.addNotificationListener((notification) => {
    // Handle notification tap
    handleNotificationAction(notification);
  });
}, []);

// 2. Send device token to backend
await apiClient.post('/notifications/register-device', {
  deviceToken: token,
  deviceType: Platform.OS, // ios or android
});
```

### Handling Notifications

```typescript
addNotificationListener((notification) => {
  const action = notification.request.content.data.action;
  
  switch(action) {
    case 'booking_confirmed':
      navigation.navigate('Bookings');
      break;
    case 'payment_received':
      showSnackbar('Payment processed');
      break;
  }
});
```

---

## 🗄️ State Management (Zustand)

### Using Stores

```typescript
import { useAuthStore, useBookingStore } from '../store';

function BookingsList() {
  const { bookings, isLoading, setBookings } = useBookingStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchBookings = async () => {
      const data = await apiClient.get(`/bookings?userId=${user.id}`);
      setBookings(data);
    };
    
    fetchBookings();
  }, []);
  
  if (isLoading) return <ActivityIndicator />;
  
  return (
    <FlatList
      data={bookings}
      renderItem={({ item }) => <BookingCard booking={item} />}
    />
  );
}
```

### Creating Custom Stores

```typescript
import { create } from 'zustand';

interface PaymentState {
  amount: number;
  setAmount: (amount: number) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  amount: 0,
  setAmount: (amount) => set({ amount }),
  reset: () => set({ amount: 0 }),
}));
```

---

## 📡 API Integration

### Making Requests

```typescript
// GET
const bookings = await apiClient.get<Booking[]>('/bookings');

// POST
const created = await apiClient.post<Booking>(
  '/bookings',
  { serviceId, staffId, startTime }
);

// PUT
const updated = await apiClient.put<Booking>(
  `/bookings/${id}`,
  { status: 'CANCELLED' }
);

// DELETE
await apiClient.delete(`/bookings/${id}`);
```

### Error Handling

```typescript
try {
  const result = await apiClient.post('/bookings', data);
  showSnackbar('Booking created!');
} catch (error) {
  if (error.response?.status === 400) {
    setError('Invalid input');
  } else if (error.response?.status === 401) {
    // Handle auth error
  } else {
    setError(ERROR_MESSAGES.SERVER_ERROR);
  }
}
```

---

## 🧪 Testing

```bash
# Unit tests with Jest
npm test

# Test specific file
npm test BookingService

# Coverage report
npm test -- --coverage
```

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

describe('LoginScreen', () => {
  it('should submit form with valid credentials', async () => {
    render(<LoginScreen />);
    
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Log In'));
    
    // Assert login was called
  });
});
```

---

## 📱 Responsive Design

### Screen Size Constants

```typescript
import { useWindowDimensions } from 'react-native';

function MyScreen() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  return (
    <View style={isSmallScreen ? styles.smallScreen : styles.largeScreen}>
      ...
    </View>
  );
}
```

### Flex Layout Best Practices

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    marginBottom: 8,
  },
});
```

---

## 🚢 Deployment

### Development Build

```bash
npm start
# Scan QR code with Expo Go app
```

### EAS Build (Physical Devices)

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### App Store Submission

```bash
# Build for submission
eas build --platform ios --auto-submit

# Configure app.json with proper settings:
{
  "name": "BeautlyAI",
  "slug": "beautlyai",
  "version": "1.0.0",
  "orientation": "portrait",
  "runtimeVersion": "1.0.0",
  "owner": "viralgaraj"
}
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
npm start -- --clear
```

### Native Module Errors
```bash
npm install
cd ios && pod install && cd ..
npx react-native doctor
```

### Device Connection Issues
```bash
adb devices        # Android
xcrun simctl list  # iOS
```

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Expo Docs](https://docs.expo.dev/)

---

**Last Updated:** April 2026 | React Native 0.73 | Expo 50+

