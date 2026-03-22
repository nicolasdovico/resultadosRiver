import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { createPreference } from '@/api/generated/endpoints/payments/payments';

export default function PremiumScreen() {
  const router = useRouter();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initPayment();
  }, []);

  const initPayment = async () => {
    try {
      const response = await createPreference();
      // @ts-expect-error - Response structure
      if (response.sandbox_init_point) {
        // @ts-expect-error - Response structure
        setCheckoutUrl(response.sandbox_init_point);
      }
    } catch (error) {
      console.error('Payment Init Error:', error);
      alert('No se pudo iniciar el pago');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes('success')) {
      alert('¡Suscripción Premium Activada!');
      router.replace('/(tabs)/profile');
    } else if (navState.url.includes('failure')) {
      alert('El pago no pudo completarse');
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {checkoutUrl && (
        <WebView 
          source={{ uri: checkoutUrl }} 
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
