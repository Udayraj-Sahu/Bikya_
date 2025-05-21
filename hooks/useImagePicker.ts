import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

interface ImagePickerResult {
  uri: string | null;
  error: string | null;
  loading: boolean;
}

export function useImagePicker() {
  const [result, setResult] = useState<ImagePickerResult>({
    uri: null,
    error: null,
    loading: false,
  });

  const pickImage = async () => {
    setResult({ uri: null, error: null, loading: true });

    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          setResult({
            uri: null,
            error: 'Permission to access camera roll was denied',
            loading: false,
          });
          return;
        }
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        setResult({
          uri: pickerResult.assets[0].uri,
          error: null,
          loading: false,
        });
      } else {
        setResult({
          uri: null,
          error: null,
          loading: false,
        });
      }
    } catch (error) {
      setResult({
        uri: null,
        error: 'Failed to pick image',
        loading: false,
      });
    }
  };

  const takePhoto = async () => {
    setResult({ uri: null, error: null, loading: true });

    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          setResult({
            uri: null,
            error: 'Permission to access camera was denied',
            loading: false,
          });
          return;
        }
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        setResult({
          uri: pickerResult.assets[0].uri,
          error: null,
          loading: false,
        });
      } else {
        setResult({
          uri: null,
          error: null,
          loading: false,
        });
      }
    } catch (error) {
      setResult({
        uri: null,
        error: 'Failed to take photo',
        loading: false,
      });
    }
  };

  const resetImage = () => {
    setResult({
      uri: null,
      error: null,
      loading: false,
    });
  };

  return {
    ...result,
    pickImage,
    takePhoto,
    resetImage,
  };
}