import { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import Colors from '@/constants/Colors';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Auto redirect if user is already logged in
    // Use a ref to ensure we only redirect once
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      if (user.role === 'user') {
        router.replace('/(app)/(user)');
      } else if (user.role === 'admin') {
        router.replace('/(app)/(admin)');
      } else if (user.role === 'owner') {
        router.replace('/(app)/(owner)');
      }
    }
  }, [user, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/5465/bike-bicycle-shadow-water.jpg' }}
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.logoContent}>
          <Text style={styles.logoText}>Bikya</Text>
          <Text style={styles.tagline}>Rent a bike, anytime, anywhere</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${Colors.light.tertiary}20` }]}>
              <Text style={[styles.featureIconText, { color: Colors.light.tertiary }]}>🚲</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Wide Selection</Text>
              <Text style={styles.featureDescription}>Choose from a variety of bikes for any purpose</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${Colors.light.secondary}20` }]}>
              <Text style={[styles.featureIconText, { color: Colors.light.secondary }]}>📍</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Location Based</Text>
              <Text style={styles.featureDescription}>Find bikes near you with GPS tracking</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${Colors.light.primary}20` }]}>
              <Text style={[styles.featureIconText, { color: Colors.light.primary }]}>💳</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Easy Payments</Text>
              <Text style={styles.featureDescription}>Secure and quick payment options</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Sign Up" 
            onPress={() => router.push('/(auth)/signup')} 
            fullWidth 
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Login" 
            onPress={() => router.push('/(auth)/login')} 
            type="outline" 
            fullWidth 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    height: '45%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  featuresContainer: {
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 22,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.grey3,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  buttonSpacer: {
    height: 12,
  },
});