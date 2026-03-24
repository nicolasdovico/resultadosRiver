import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { getPartidos } from '@/api/generated/endpoints/partidos/partidos';

interface Partido {
  fecha: string;
  rival?: {
    ri_desc: string;
  };
  torneo?: {
    tor_desc: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
}

export default function ResultadosScreen() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('Resultados');

  useEffect(() => {
    fetchPartidos();
  }, []);

  const fetchPartidos = async () => {
    try {
      // Use 'hoy: true' to get the dynamic behavior from backend
      // @ts-expect-error - customInstance structure
      const response = await getPartidos({ hoy: true, limit: 20 });
      
      if (response && (response as any).data) {
        setPartidos((response as any).data);
      }
      
      if (response && (response as any).meta?.title) {
        setSectionTitle((response as any).meta.title);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{sectionTitle}</Text>
      <Text style={styles.headerSubtitle}>Explora el historial del Más Grande</Text>
    </View>
  );

  const renderPartido = ({ item }: { item: Partido }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.fecha}>{item.fecha}</Text>
        <Text style={styles.torneo} numberOfLines={1} ellipsizeMode="tail">
          {item.torneo?.tor_desc || 'Torneo'}
        </Text>
      </View>
      <View style={styles.matchRow}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName} numberOfLines={1}>River Plate</Text>
        </View>
        
        <View style={[styles.scoreBadge, 
          item.resultado === 'G' ? styles.win : 
          item.resultado === 'P' ? styles.loss : styles.draw
        ]}>
          <Text style={styles.scoreText}>{item.goles_river} - {item.goles_rival}</Text>
        </View>

        <View style={[styles.teamContainer, styles.alignRight]}>
          <Text style={[styles.teamName, styles.textRight]} numberOfLines={1}>
            {item.rival?.ri_desc || 'Rival'}
          </Text>
        </View>
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
        keyExtractor={(item, index) => `${item.fecha}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No se encontraron partidos para hoy.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  list: {
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  fecha: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  torneo: {
    fontSize: 10,
    color: '#b91c1c',
    fontWeight: '800',
    textTransform: 'uppercase',
    maxWidth: '60%',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  textRight: {
    textAlign: 'right',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  win: { 
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loss: { 
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  draw: { 
    backgroundColor: '#64748b',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontWeight: '600',
  }
});
