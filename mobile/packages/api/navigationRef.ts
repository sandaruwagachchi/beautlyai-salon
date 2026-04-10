import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

let authRouteName = 'Login';

export const setAuthRouteName = (routeName: string): void => {
  authRouteName = routeName;
};

export const navigateToAuth = (): void => {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.reset({
    index: 0,
    routes: [{ name: authRouteName }],
  });
};
