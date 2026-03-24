import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isPremium } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user ? getInitials(user.name) : '??'}</Text>
      </View>
      <Text style={styles.title}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <View style={isPremium ? styles.premiumBadge : styles.freeBadge}>
        <Text style={isPremium ? styles.premiumText : styles.freeText}>
          {isPremium ? 'Socio Premium' : 'Usuario Free'}
        </Text>
      </View>

      {!isPremium && (
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => router.push('/premium')}
        >
          <Text style={styles.premiumButtonText}>Hacerme Premium</Text>
        </TouchableOpacity>
      )}

      {isPremium ? (
        <View style={styles.premiumInfoCard}>
          <Text style={styles.premiumInfoTitle}>✨ Beneficios Activos</Text>
          <Text style={styles.premiumInfoText}>✓ Estadísticas detalladas de jugadores</Text>
          <Text style={styles.premiumInfoText}>✓ Gráficos de rendimiento histórico</Text>
          <Text style={styles.premiumInfoText}>✓ Sin publicidad</Text>
        </View>
      ) : (
        <Text style={styles.info}>Desbloquea estadísticas avanzadas y gráficos exclusivos convirtiéndote en Premium.</Text>
      )}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
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
    fontWeight: '900',
    color: '#1e293b',
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
  premiumBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  premiumText: {
    color: '#b45309',
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
  premiumInfoCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  premiumInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  premiumInfoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  info: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
