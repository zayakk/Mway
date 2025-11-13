import { Redirect } from 'expo-router';

export default function Index() {
  // Immediately redirect to login page
  return <Redirect href="/login" />;
}

