import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { getPartidos } from '@/api/generated/endpoints/partidos/partidos';

interface Partido {
  fecha: string;
  rival: {
    riv_nombre: string;
  };
  torneo: {
    tor_nombre: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
}

export default function ResultadosScreen() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartidos();
  }, []);

  const fetchPartidos = async () => {
    try {
      const response = await getPartidos();
      // @ts-expect-error - Resource data structure
      setPartidos(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderPartido = ({ item }: { item: Partido }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.fecha}>{item.fecha}</Text>
        <Text style={styles.torneo}>{item.torneo.tor_nombre}</Text>
      </View>
      <View style={styles.matchRow}>
        <Text style={styles.teamName}>River Plate</Text>
        <View style={[styles.scoreBadge, 
          item.resultado === 'G' ? styles.win : 
          item.resultado === 'P' ? styles.loss : styles.draw
        ]}>
          <Text style={styles.scoreText}>{item.goles_river} - {item.goles_rival}</Text>
        </View>
        <Text style={styles.teamName}>{item.rival.riv_nombre}</Text>
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
        data={partidos}
        renderItem={renderPartido}
        keyExtractor={(item) => item.fecha}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No se encontraron partidos.</Text>
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  fecha: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'bold',
  },
  torneo: {
    fontSize: 10,
    color: '#b91c1c',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  win: { backgroundColor: '#22c55e' },
  loss: { backgroundColor: '#ef4444' },
  draw: { backgroundColor: '#94a3b8' },
  empty: {
    padding: 40,
    alignItems: 'center',
  }
});
