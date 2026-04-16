import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { customInstance } from '@/api/custom-instance';

const { width } = Dimensions.get('window');

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  goles_count?: number;
}

interface TopScorer {
  pl_id: number;
  name: string;
  goals: number;
  pos: number;
}

export default function JugadoresScreen() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  
  const { token, isPremium } = useAuth();
  const isLoggedIn = !!token;
  const router = useRouter();

  useEffect(() => {
    fetchJugadores();
    if (!query) {
      fetchTopScorers();
    }
  }, [query, isLoggedIn]);

  const fetchJugadores = async () => {
    setLoading(true);
    try {
      const response = await customInstance<{ data: Jugador[], meta?: any }>({
        url: '/v1/jugadores',
        method: 'GET',
        params: { q: query, limit: query ? 50 : 20 }
      });
      
      const data = response.data || [];
      setJugadores(data);
      setTotalResults(response.meta?.total || data.length);
    } catch (error) {
      console.error('Fetch Jugadores Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopScorers = async () => {
    try {
      const response = await customInstance<{ data: TopScorer[] }>({
        url: '/v1/jugadores/top-scorers',
        method: 'GET'
      });
      setTopScorers(response.data || []);
    } catch (error) {
      console.error('Fetch Top Scorers Error:', error);
    }
  };

  const renderTopGoleadores = () => {
    if (query || topScorers.length === 0) return null;
    
    return (
      <View style={styles.topSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="trophy" size={20} color="#dc2626" />
          <Text style={styles.sectionTitle}>Goleadores Inmortales</Text>
        </div>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={topScorers}
          keyExtractor={(item) => item.pos.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.topCard}
              onPress={() => router.push(`/jugadores/${item.pl_id}`)}
            >
              <Text style={styles.topPos}>#{item.pos}</Text>
              <Text style={styles.topName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.topGoalsContainer}>
                <Text style={styles.topGoals}>{item.goals}</Text>
                <Text style={styles.topGoalsLabel}>Goles</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.topList}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Jugadores</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalResults}</Text>
        </View>
      </View>
      
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar figura..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {renderTopGoleadores()}
      
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{query ? 'Resultados' : 'Archivo Completo'}</Text>
      </View>
    </View>
  );

  const renderJugador = ({ item }: { item: Jugador }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => router.push(`/jugadores/${item.pl_id}`)}
    >
      <View style={styles.playerInfo}>
        <View style={styles.avatarContainer}>
          {item.pl_foto ? (
            <Image 
              source={{ uri: item.pl_foto }} 
              style={styles.avatarImage} 
              contentFit="cover"
              contentPosition="top center"
            />
          ) : (
            <Text style={styles.avatarText}>{item.pl_apno.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.playerName} numberOfLines={1}>{item.pl_apno}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.goalsCount}>{item.goles_count || 0}</Text>
        <Text style={styles.goalsLabel}>Goles</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={18} color="#e2e8f0" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jugadores}
        renderItem={renderJugador}
        keyExtractor={(item) => item.pl_id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>No encontramos a "{query}"</Text>
            </View>
          ) : null
        }
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  topSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  topList: {
    gap: 12,
  },
  topCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  topPos: {
    fontSize: 40,
    fontWeight: '900',
    color: '#f8fafc',
    position: 'absolute',
    right: 10,
    bottom: 5,
    fontStyle: 'italic',
  },
  topName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  topGoalsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  topGoals: {
    fontSize: 24,
    fontWeight: '900',
    color: '#dc2626',
  },
  topGoalsLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  listHeader: {
    marginTop: 12,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  nameContainer: {
    marginLeft: 16,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  playerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  goalsCount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  goalsLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
