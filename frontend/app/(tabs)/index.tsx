import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { HomeQuickSearch } from '@/components/home-quick-search';
import { LangSwitch } from '@/components/lang-switch';

const API_URL = 'http://127.0.0.1:8000/api/hello/'; // change to LAN IP on physical device

export default function HomeScreen() {
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setApiMessage(data?.message ?? 'No message');
      })
      .catch((e) => {
        if (isMounted) setApiError(e?.message ?? 'Request failed');
      });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Хот хоорондын тээвэр</ThemedText>
        <HelloWave />
        <View style={{ marginLeft: 'auto' }}>
          <LangSwitch />
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Backend холболт</ThemedText>
        {apiError ? (
          <ThemedText>{`Error: ${apiError}`}</ThemedText>
        ) : (
          <ThemedText>{apiMessage ?? 'Contacting API…'}</ThemedText>
        )}
        <ThemedText>{`API: ${API_URL}`}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Хэрэглэгч</ThemedText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Link href="/login">
            <Link.Trigger>
              <ThemedText type="defaultSemiBold" style={styles.buttonLike}>Нэвтрэх</ThemedText>
            </Link.Trigger>
          </Link>
          <Link href="/register">
            <Link.Trigger>
              <ThemedText type="defaultSemiBold" style={styles.buttonLike}>Бүртгүүлэх</ThemedText>
            </Link.Trigger>
          </Link>
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <HomeQuickSearch />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Мэдээлэл</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Стартер аппын боломжуудыг Explore таб-аас үзнэ үү.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/search">
          <Link.Trigger>
            <ThemedText type="subtitle">Тасалбар хайх</ThemedText>
          </Link.Trigger>
          <Link.Preview />
        </Link>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/history">
          <Link.Trigger>
            <ThemedText type="subtitle">Захиалгын түүх</ThemedText>
          </Link.Trigger>
          <Link.Preview />
        </Link>
      </ThemedView>
    
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  buttonLike: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
