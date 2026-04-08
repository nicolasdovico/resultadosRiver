import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { customInstance } from '@/api/custom-instance';
import { BlurView } from 'expo-blur';
import { formatLocalDate } from '@/utils/date';

const { width } = Dimensions.get('window');

interface Gol {
  gol_fecha: string;
  minutos: number;
  tipo_gol_desc?: string;
  periodo_desc?: string;
  partido?: {
    go_ri: number;
    go_ad: number;
    rival: {
      ri_desc: string;
      escudo?: string;
    };
  };
}

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  goles_count: number;
  dias_desde_ultimo_gol?: number | null;
  partidos_desde_ultimo_gol?: number | null;
  goles: Gol[];
  is_premium_restricted?: boolean;
}

export default function JugadorDetailScreen() {
  const { id } = useLocalSearchParams();
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [loading, setLoading] = useState(true);
  const { isPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchJugador();
  }, [id]);

  const fetchJugador = async () => {
    setLoading(true);
    try {
      const response = await customInstance<{ data: Jugador }>({
        url: `/v1/jugadores/${id}`,
        method: 'GET',
      });
      setJugador(response.data);
    } catch (error) {
      console.error('Fetch Jugador Detail Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!jugador) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Jugador no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Stack.Screen options={{ 
        title: jugador.pl_apno,
        headerBackTitle: 'Atrás',
        headerTransparent: true,
        headerTintColor: '#fff',
        headerTitleStyle: { opacity: 0 }
      }} />

      {/* Hero Section - Data Console Style */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay} />
        
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {jugador.pl_foto ? (
                <Image 
                  source={{ uri: jugador.pl_foto }} 
                  style={styles.avatarImage} 
                  contentFit="cover"
                  contentPosition="top center"
                  transition={500}
                />
              ) : (
                <Text style={styles.avatarText}>{jugador.pl_apno.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
          </View>

          <View style={styles.badgeContainer}>
             <View style={styles.riverTag}><Text style={styles.riverTagText}>River Plate</Text></View>
             <View style={styles.idTag}><Text style={styles.idTagText}>ID #{jugador.pl_id}</Text></View>
          </View>

          <Text style={styles.playerName}>{jugador.pl_apno}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.mainStat}>
              <Text style={styles.mainStatValue}>{jugador.goles_count}</Text>
              <Text style={styles.mainStatLabel}>Goles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.mainStat}>
              <Text style={styles.mainStatValue}>{jugador.dias_desde_ultimo_gol ?? "-"}</Text>
              <Text style={styles.mainStatLabel}>Vigencia (Días)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.mainStat}>
              <Text style={styles.mainStatValue}>{jugador.partidos_desde_ultimo_gol ?? "-"}</Text>
              <Text style={styles.mainStatLabel}>Sequía (PJ)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="soccer" size={20} color="#dc2626" />
          <Text style={styles.sectionTitle}>Historial de Goles</Text>
        </View>

        {jugador.goles.map((gol, index) => (
          <View key={index} style={styles.goalCard}>
            <View style={styles.goalRival}>
               <View style={styles.crestContainer}>
                  {gol.partido?.rival?.escudo ? (
                    <Image source={{ uri: gol.partido.rival.escudo }} style={styles.crestImage} />
                  ) : (
                    <MaterialCommunityIcons name="shield-outline" size={24} color="#e2e8f0" />
                  )}
               </View>
               <View style={styles.goalInfo}>
                  <Text style={styles.goalNumber}>Gol #{index + 1} • {formatLocalDate(gol.gol_fecha)}</Text>
                  <Text style={styles.rivalName}>vs {gol.partido?.rival?.ri_desc}</Text>
                  <View style={styles.scoreTag}>
                     <Text style={styles.scoreText}>{gol.partido?.go_ri} - {gol.partido?.go_ad}</Text>
                  </View>
               </View>
            </View>
            <View style={styles.goalTime}>
               <Text style={styles.timeText}>{gol.minutos}'</Text>
               <Ionicons name="timer-outline" size={14} color="#94a3b8" />
            </View>
          </View>
        ))}

        {jugador.is_premium_restricted && (
          <View style={styles.restrictedContainer}>
            <BlurView intensity={80} tint="light" style={styles.blurContainer}>
              <View style={styles.premiumBox}>
                <Ionicons name="lock-closed" size={40} color="#dc2626" />
                <Text style={styles.premiumTitle}>Contenido Premium</Text>
                <Text style={styles.premiumDesc}>Estás viendo una versión limitada.{'\n'}Hazte premium para ver el historial completo.</Text>
                <TouchableOpacity 
                  style={styles.premiumButton}
                  onPress={() => router.push('/premium')}
                >
                  <Text style={styles.premiumButtonText}>HACERME PREMIUM</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
  hero: {
    backgroundColor: '#0f172a',
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 180,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    borderWidth: 4,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#334155',
    fontSize: 60,
    fontWeight: '900',
  },
  starBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0f172a',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  riverTag: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  riverTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  idTag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  idTagText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  mainStat: {
    alignItems: 'center',
    flex: 1,
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  mainStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
    marginHorizontal: 10,
  },
  content: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  goalRival: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  crestContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  crestImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  goalInfo: {
    gap: 2,
  },
  goalNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    textTransform: 'uppercase',
  },
  rivalName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  scoreTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
  },
  goalTime: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  restrictedContainer: {
    marginTop: 20,
    borderRadius: 32,
    overflow: 'hidden',
    height: 300,
  },
  blurContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  premiumBox: {
    alignItems: 'center',
    gap: 12,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  premiumDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  premiumButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
