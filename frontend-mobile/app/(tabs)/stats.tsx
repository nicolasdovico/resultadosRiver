import { StyleSheet, FlatList, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { getTorneos } from '@/api/generated/endpoints/torneos/torneos';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { TorneoResource as Torneo } from '@/api/generated/model/torneoResource';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function TorneosScreen() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  
  const { token, isPremium } = useAuth();
  const isLoggedIn = !!token;
  const router = useRouter();

  useEffect(() => {
    fetchTorneos();
  }, [query, isLoggedIn, isPremium]);

  const fetchTorneos = async () => {
    setLoading(true);
    try {
      const response = await getTorneos({ q: query } as any);
      let data: Torneo[] = (response as any).data || [];
      const total = (response as any).meta?.total || data.length;
      
      setTotalResults(total);
      
      // Strict restriction logic for all Free users (Guests and non-premium Registered)
      let restricted = false;
      if (!isPremium) {
        const limit = 10;
        if (total > limit) {
          data = data.slice(0, limit);
          restricted = true;
        }
      }
      
      setTorneos(data);
      setIsRestricted(restricted);
      
    } catch (error) {
      console.error('Fetch Torneos Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Torneos</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{totalResults}</Text>
        </View>
      </View>
      
      {isLoggedIn ? (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneo o año..."
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
            <Text style={styles.guestBannerText}>Inicia sesión para ver estadísticas</Text>
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
              Viendo {torneos.length} de {totalResults}. Sé premium para ver todo el archivo.
            </Text>
          </View>
          <Text style={styles.premiumLink}>Ver más</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTorneo = ({ item }: { item: Torneo }) => {
    const stats = item.stats as any;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.yearTag}>
            <Text style={styles.yearText}>{item.tor_anio}</Text>
          </View>
          <Text style={styles.torneoName} numberOfLines={1}>
            {item.tor_desc}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.pj || 0}</Text>
            <Text style={styles.statLabel}>PJ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{stats?.pg || 0}</Text>
            <Text style={styles.statLabel}>PG</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#94a3b8' }]}>{stats?.pe || 0}</Text>
            <Text style={styles.statLabel}>PE</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats?.pp || 0}</Text>
            <Text style={styles.statLabel}>PP</Text>
          </View>
        </View>

        {isPremium ? (
          <View style={styles.premiumStats}>
            <View style={styles.divider} />
            <View style={styles.advancedStatsGrid}>
              <View style={styles.advStatRow}>
                <Text style={styles.advStatLabel}>Goles:</Text>
                <Text style={styles.advStatValue}>{stats?.gf} F / {stats?.gc} C ({stats?.dg})</Text>
              </View>
              <View style={styles.advStatRow}>
                <Text style={styles.advStatLabel}>Efectividad:</Text>
                <Text style={styles.advStatValue}>{stats?.efectividad}%</Text>
              </View>
              <View style={styles.advStatRow}>
                <Text style={styles.advStatLabel}>Vallas Invictas:</Text>
                <Text style={styles.advStatValue}>{stats?.vallas_invictas}</Text>
              </View>
            </View>
            
            <View style={styles.chartContainer}>
               <PieChart
                data={[
                  { name: 'PG', population: stats?.pg || 0, color: '#10b981', legendFontColor: '#64748b', legendFontSize: 10 },
                  { name: 'PE', population: stats?.pe || 0, color: '#94a3b8', legendFontColor: '#64748b', legendFontSize: 10 },
                  { name: 'PP', population: stats?.pp || 0, color: '#ef4444', legendFontColor: '#64748b', legendFontSize: 10 },
                ]}
                width={screenWidth - 80}
                height={120}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>
        ) : (
          isLoggedIn && (
            <View style={styles.lockedStats}>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.lockOverlay}
                onPress={() => router.push('/premium')}
              >
                <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                <Text style={styles.lockText}>Estadísticas avanzadas bloqueadas</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={torneos}
        renderItem={renderTorneo}
        keyExtractor={(item) => item.tor_id?.toString() || ''}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="trophy-outline" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>No se encontraron torneos</Text>
            </View>
          ) : null
        }
        refreshing={loading && torneos.length > 0}
        onRefresh={fetchTorneos}
      />
      {loading && torneos.length === 0 && (
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  yearTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  torneoName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  premiumStats: {
    marginTop: 5,
  },
  advancedStatsGrid: {
    gap: 8,
    marginBottom: 15,
  },
  advStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advStatLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  advStatValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '800',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  lockedStats: {
    alignItems: 'center',
  },
  lockOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  lockText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
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
