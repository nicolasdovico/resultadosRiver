import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { verifyOtp } from '@/api/generated/endpoints/authentication/authentication';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert('Error', 'Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({
        email: email as string,
        code: code
      });
      
      Alert.alert(
        '¡Listo!', 
        'Email verificado correctamente. Ya puedes iniciar sesión.',
        [{ text: 'Ir al Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      console.error('OTP Error:', error);
      Alert.alert('Error', 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificar Email</Text>
        <Text style={styles.subtitle}>Ingresá el código enviado a {email}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          letterSpacing={8}
          textAlign="center"
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Código</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#b91c1c',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: '#64748b',
    fontSize: 14,
  },
});
