import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

const ONBOARDING_KEY = 'theekzu:onboarding_done';

SplashScreen.preventAutoHideAsync();

export default function IndexRedirect() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setOnboardingDone(v === 'true');
      setReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
