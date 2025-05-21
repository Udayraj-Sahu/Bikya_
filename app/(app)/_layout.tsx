import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';

export default function AppLayout() {
  const { user } = useAppSelector(state => state.auth);
  
  if (!user) {
    return <Redirect href="/" />;
  }
  
  if (user.role === 'user') {
    return <Redirect href="/(app)/(user)" />;
  } else if (user.role === 'admin') {
    return <Redirect href="/(app)/(admin)" />;
  } else if (user.role === 'owner') {
    return <Redirect href="/(app)/(owner)" />;
  }
  
  // Fallback
  return <Redirect href="/" />;
}