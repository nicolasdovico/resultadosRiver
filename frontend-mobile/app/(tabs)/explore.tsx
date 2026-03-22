import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { getTorneos } from '@/api/generated/endpoints/torneos/torneos';

interface Torneo {
  id: number;
  tor_nombre: string;
  tor_nivel: string;
  tor_periodo: string;
}

export default function TorneosScreen() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTorneos();
  }, []);

  const fetchTorneos = async () => {
    try {
      const response = await getTorneos();
      // @ts-expect-error - Resource data structure
      setTorneos(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTorneo = ({ item }: { item: Torneo }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Nivel {item.tor_nivel}</Text>
      </View>
      <Text style={styles.name}>{item.tor_nombre}</Text>
      <Text style={styles.periodo}>Periodo: {item.tor_periodo}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={torneos}
        renderItem={renderTorneo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badge: {
    backgroundColor: '#fee2e2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  periodo: {
    fontSize: 14,
    color: '#64748b',
  },
});
