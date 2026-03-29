import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { getPartidos } from '@/api/generated/endpoints/partidos/partidos';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { formatLocalDate } from '@/utils/date';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { PartidoResource as Partido } from '@/api/generated/model/partidoResource';

const RIVER_SHIELD = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C_A_River_Plate.svg/1200px-Escudo_del_C_A_River_Plate.svg.png';

export default function ResultadosScreen() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('Resultados');
  
  const { token, isPremium } = useAuth();
  const isLoggedIn = !!token;
  const router = useRouter();

  useEffect(() => {
    fetchPartidos();
  }, [query, isLoggedIn, isPremium]);

  const fetchPartidos = async () => {
    setLoading(true);
    try {
      // @ts-expect-error - Resource data structure is not fully typed in SDK
      const response = await getPartidos(
        { 
          q: query, 
          hoy: (query || isLoggedIn) ? undefined : true,
          limit: (isLoggedIn && !query) ? 10 : undefined 
        } as any
      );
      
      let data: Partido[] = (response as any).data || [];
      const total = (response as any).meta?.total || data.length;
      
      setTotalResults(total);
      
      // Restriction logic for non-premium users during search
      let restricted = false;
      if (query && isLoggedIn && !isPremium) {
        let limit = 20;
        if (total <= 20) {
          limit = Math.max(3, Math.floor(total * 0.5));
        }
        
        if (total > limit) {
          data = data.slice(0, limit);
          restricted = true;
        }
      }
      
      setPartidos(data);
      setIsRestricted(restricted);
      
      if ((response as any).meta?.title) {
        setSectionTitle((response as any).meta.title);
      } else {
        setSectionTitle(query ? 'Resultados' : (isLoggedIn ? 'Últimos 10' : 'Partidos de Hoy'));
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{totalResults}</Text>
        </View>
      </View>
      
      {isLoggedIn ? (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por rival o torneo..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#94a3b8"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.guestBanner}
          onPress={() => router.push('/(auth)/login')}
        >
          <View style={styles.guestBannerContent}>
            <Ionicons name="log-in-outline" size={18} color="#b91c1c" />
            <Text style={styles.guestBannerText}>Inicia sesión para ver el historial completo</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#b91c1c" />
        </TouchableOpacity>
      )}

      {isRestricted && (
        <TouchableOpacity 
          style={styles.premiumBanner}
          onPress={() => router.push('/premium')}
        >
          <View style={styles.premiumBannerLeft}>
            <MaterialCommunityIcons name="crown" size={20} color="#b45309" />
            <Text style={styles.premiumBannerText}>
              Viendo {partidos.length} de {totalResults}. Sé premium para ver todo.
            </Text>
          </View>
          <Text style={styles.premiumLink}>Ver más</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPartido = ({ item }: { item: Partido }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => isLoggedIn ? router.push({ pathname: '/modal', params: { fecha: item.fecha } }) : router.push('/(auth)/login')}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateTag}>
          <Text style={styles.fecha}>{formatLocalDate(item.fecha || '')}</Text>
        </View>
        <Text style={styles.torneo} numberOfLines={1}>
          {item.torneo?.tor_desc || 'Torneo'}
        </Text>
      </View>
      
      <View style={styles.matchBody}>
        <View style={styles.teamsContainer}>
          <View style={styles.teamRow}>
            <Image 
              source={{ uri: RIVER_SHIELD }} 
              style={styles.shield}
              contentFit="contain"
              transition={200}
            />
            <Text style={styles.riverName}>River Plate</Text>
          </View>
          <View style={[styles.teamRow, { marginTop: 8 }]}>
            <Image 
              source={{ uri: item.rival?.escudo_url || 'https://via.placeholder.com/40?text=R' }} 
              style={styles.shield}
              contentFit="contain"
              placeholder={'https://via.placeholder.com/40?text=R'}
              transition={200}
              onError={(e) => console.log(`Error loading shield for ${item.rival?.ri_desc}:`, e.error, 'URL:', item.rival?.escudo_url)}
              onLoad={() => console.log(`Successfully loaded shield for ${item.rival?.ri_desc}`)}
            />
            <Text style={styles.rivalName}>{item.rival?.ri_desc || 'Rival'}</Text>
          </View>
        </View>
        
        <View style={styles.scoreAndStatus}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, 
              item.resultado === 'G' ? styles.winText : 
              item.resultado === 'P' ? styles.lossText : styles.drawText
            ]}>
              {item.goles_river} - {item.goles_rival}
            </Text>
          </View>
          <View style={[styles.statusBadge, 
            item.resultado === 'G' ? styles.winBadge : 
            item.resultado === 'P' ? styles.lossBadge : styles.drawBadge
          ]}>
            <Text style={styles.statusText}>{item.resultado}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={partidos}
        renderItem={renderPartido}
        keyExtractor={(item, index) => `${item.fecha}-${index}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>No se encontraron partidos</Text>
            </View>
          ) : null
        }
        refreshing={loading && partidos.length > 0}
        onRefresh={fetchPartidos}
      />
      {loading && partidos.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#b91c1c" />
        </View>
      )}
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
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  guestBanner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  guestBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guestBannerText: {
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '700',
  },
  premiumBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  premiumBannerText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    flex: 1,
  },
  premiumLink: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
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
  dateTag: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fecha: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  torneo: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '800',
    textTransform: 'uppercase',
    maxWidth: '65%',
  },
  matchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamsContainer: {
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shield: {
    width: 24,
    height: 24,
  },
  riverName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  rivalName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scoreAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  winText: { color: '#10b981' },
  lossText: { color: '#ef4444' },
  drawText: { color: '#94a3b8' },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winBadge: { backgroundColor: '#10b981' },
  lossBadge: { backgroundColor: '#ef4444' },
  drawBadge: { backgroundColor: '#94a3b8' },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
