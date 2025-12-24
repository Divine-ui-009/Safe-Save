import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [groupTotal, setGroupTotal] = useState<number | null>(null);
  const [userSavings, setUserSavings] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

  const connectWallet = async () => {
    try {
      setError(null);
      if (!baseUrl) {
        setError('Missing EXPO_PUBLIC_API_BASE_URL');
        return;
      }

      const addr = `addr_test1_expo_${Date.now()}`;
      const res = await fetch(`${baseUrl}/api/auth/connect-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Connect wallet failed');
      }

      setWalletAddress(addr);
      setToken(data.token);
    } catch (e: any) {
      setError(e?.message || 'Connect wallet failed');
    }
  };

  const loadSavings = async () => {
    try {
      setError(null);
      if (!baseUrl) {
        setError('Missing EXPO_PUBLIC_API_BASE_URL');
        return;
      }
      if (!token || !walletAddress) {
        setError('Connect wallet first');
        return;
      }

      const [groupRes, userRes] = await Promise.all([
        fetch(`${baseUrl}/api/savings/group/total`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/savings/${walletAddress}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const groupJson = await groupRes.json();
      const userJson = await userRes.json();

      if (groupRes.ok && typeof groupJson?.groupTotal === 'number') {
        setGroupTotal(groupJson.groupTotal);
      }

      if (userRes.ok && typeof userJson?.savings?.totalSavings === 'number') {
        setUserSavings(userJson.savings.totalSavings);
      }

      if (!groupRes.ok) {
        throw new Error(groupJson?.error || 'Failed to load group total');
      }
      if (!userRes.ok) {
        throw new Error(userJson?.error || 'Failed to load user savings');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load savings');
    }
  };

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
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Safe-Save Integration</ThemedText>
        <ThemedText>
          API: {baseUrl || '(set EXPO_PUBLIC_API_BASE_URL)'}
        </ThemedText>
        <ThemedText>
          Wallet: {walletAddress || '(not connected)'}
        </ThemedText>
        <ThemedText>
          Group total: {groupTotal ?? '(not loaded)'}
        </ThemedText>
        <ThemedText>
          Your savings: {userSavings ?? '(not loaded)'}
        </ThemedText>
        {error ? <ThemedText>{error}</ThemedText> : null}

        <ThemedView style={styles.row}>
          <Pressable style={styles.button} onPress={connectWallet}>
            <ThemedText type="defaultSemiBold">Connect Wallet</ThemedText>
          </Pressable>
          <Pressable style={styles.button} onPress={loadSavings}>
            <ThemedText type="defaultSemiBold">Load Savings</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
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
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
