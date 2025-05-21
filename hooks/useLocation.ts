import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationState {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  errorMsg: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    loading: true,
  });

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setState({
          location: { latitude: 12.9716, longitude: 77.5946 }, // Default location for web (Bangalore)
          errorMsg: null,
          loading: false,
        });
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setState({
            location: null,
            errorMsg: 'Permission to access location was denied',
            loading: false,
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setState({
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          errorMsg: null,
          loading: false,
        });
      } catch (error) {
        setState({
          location: null,
          errorMsg: 'Failed to get location',
          loading: false,
        });
      }
    })();
  }, []);

  const requestLocationPermission = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    if (Platform.OS === 'web') {
      setState({
        location: { latitude: 12.9716, longitude: 77.5946 }, // Default location for web (Bangalore)
        errorMsg: null,
        loading: false,
      });
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({
          location: null,
          errorMsg: 'Permission to access location was denied',
          loading: false,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setState({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        errorMsg: null,
        loading: false,
      });
    } catch (error) {
      setState({
        location: null,
        errorMsg: 'Failed to get location',
        loading: false,
      });
    }
  };

  return {
    ...state,
    requestLocationPermission,
  };
}