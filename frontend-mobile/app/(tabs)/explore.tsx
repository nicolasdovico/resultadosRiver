import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { getTorneos } from '@/api/generated/endpoints/torneos/torneos';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Nivel {item.tor_nivel}</Text>
        </View>
        <MaterialCommunityIcons name="trophy-outline" size={20} color="#b91c1c" />
      </View>
      
      <Text style={styles.name} numberOfLines={2}>{item.tor_nombre}</Text>
      
      <View style={styles.footer}>
        <View style={styles.periodoContainer}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.periodo}>{item.tor_periodo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      </View>
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
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Archivo de Torneos</Text>
            <Text style={styles.headerSubtitle}>Explora la historia competitiva</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No se encontraron torneos</Text>
          </View>
        }
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
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  periodoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodo: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
