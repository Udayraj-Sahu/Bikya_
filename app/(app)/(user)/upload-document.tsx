// app/(app)/(user)/upload-documents.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For document type selection
import * as ImagePicker from 'expo-image-picker'; // Using expo-image-picker directly
import Button from '@/components/Button'; // Your Button component
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { uploadUserDocumentThunk, fetchUserDocumentsThunk, clearDocumentError } from '@/redux/slices/documentSlice';
import { Document as DocumentType } from '@/types';
import Colors from '@/constants/Colors'; // Your Colors
import DocumentCard from '@/components/DocumentCard'; // Your DocumentCard component

export default function UploadDocumentsScreen() {
  const dispatch = useAppDispatch();
  const { userDocuments, isUploading, isLoading, error } = useAppSelector((state) => state.documents);
  const authUser = useAppSelector((state) => state.auth.user);


  const [documentType, setDocumentType] = useState<'idCard' | 'drivingLicense'>('idCard');
  const [frontImage, setFrontImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [backImage, setBackImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    // Request permissions on mount if not already granted
    (async () => {
      if (Platform.OS !== 'web') {
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (galleryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
          Alert.alert('Permissions Required', 'Sorry, we need camera and gallery permissions to allow document uploads.');
        }
      }
    })();
    // Fetch existing documents when the screen loads
    dispatch(fetchUserDocumentsThunk());
    
    // Clear any previous errors when the component mounts
    dispatch(clearDocumentError());

  }, [dispatch]);

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>) => {
    Alert.alert("Select Image", "Choose an option to select your document image.", [
      {
        text: "Choose from Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3], // Adjust aspect ratio as needed
            quality: 0.7, // Compress image slightly
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
          }
        }
      },
      {
        text: "Take Photo",
        onPress: async () => {
           let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
          }
        }
      },
      { text: "Cancel", style: "cancel"}
    ]);
  };

  const handleUpload = async () => {
    if (!frontImage) {
      Alert.alert('Missing Image', 'Please select at least the front image of your document.');
      return;
    }
    if (!authUser?.id) {
        Alert.alert('Error', 'User not authenticated.');
        return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    
    // Append front image
    // The backend expects 'frontImage' and 'backImage' as field names
    if (frontImage) {
        const frontImageName = frontImage.uri.split('/').pop() || `front-${Date.now()}.jpg`;
        const frontImageType = frontImage.mimeType || 'image/jpeg';
        formData.append('frontImage', {
            uri: frontImage.uri,
            name: frontImageName,
            type: frontImageType,
        } as any); // Type assertion needed for FormData value
    }

    // Append back image if selected
    if (backImage) {
        const backImageName = backImage.uri.split('/').pop() || `back-${Date.now()}.jpg`;
        const backImageType = backImage.mimeType || 'image/jpeg';
        formData.append('backImage', {
            uri: backImage.uri,
            name: backImageName,
            type: backImageType,
        } as any);
    }
    
    const resultAction = await dispatch(uploadUserDocumentThunk(formData));
    if (uploadUserDocumentThunk.fulfilled.match(resultAction)) {
      Alert.alert('Success', 'Documents uploaded successfully! Awaiting approval.');
      setFrontImage(null);
      setBackImage(null);
    } else {
      Alert.alert('Upload Failed', resultAction.payload as string || 'An unknown error occurred.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Upload Your ID Proof</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Document Type:</Text>
        <Picker
          selectedValue={documentType}
          style={styles.picker}
          onValueChange={(itemValue) => setDocumentType(itemValue)}
        >
          <Picker.Item label="ID Card" value="idCard" />
          <Picker.Item label="Driver's License" value="drivingLicense" />
        </Picker>
      </View>

      <Button title="Select Front Image" onPress={() => pickImage(setFrontImage)} />
      {frontImage && <Image source={{ uri: frontImage.uri }} style={styles.imagePreview} />}

      <View style={{ marginVertical: 10 }} />

      <Button title="Select Back Image (Optional)" onPress={() => pickImage(setBackImage)} />
      {backImage && <Image source={{ uri: backImage.uri }} style={styles.imagePreview} />}

      {isUploading ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />
      ) : (
        <Button title="Upload Documents" onPress={handleUpload}  />
      )}

      <View style={styles.separator} />
      <Text style={styles.subTitle}>My Submitted Documents</Text>
      {isLoading && userDocuments.length === 0 && <ActivityIndicator size="small" color={Colors.light.text} />}
      {userDocuments.length === 0 && !isLoading && <Text style={styles.noDocumentsText}>You haven't uploaded any documents yet.</Text>}
      {userDocuments.map((doc) => (
        <DocumentCard key={doc.id} document={doc as DocumentType} /> // Use your DocumentCard component
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 5,
    paddingLeft: 10,
    paddingTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 15,
  },
  noDocumentsText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  }
});
