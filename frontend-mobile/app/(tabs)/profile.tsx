import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>RP</Text>
      </View>
      <Text style={styles.title}>Juan Perez</Text>
      <Text style={styles.email}>juan@example.com</Text>
      
      <View style={styles.freeBadge}>
        <Text style={styles.freeText}>Usuario Free</Text>
      </View>

      <TouchableOpacity 
        style={styles.premiumButton}
        onPress={() => router.push('/premium')}
      >
        <Text style={styles.premiumButtonText}>Hacerme Premium</Text>
      </TouchableOpacity>

      <Text style={styles.info}>Desbloquea estadísticas avanzadas y gráficos exclusivos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'black',
    color: '#94a3b8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  freeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 32,
  },
  freeText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  premiumButton: {
    backgroundColor: '#b91c1c',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    paddingHorizontal: 40,
  },
});
