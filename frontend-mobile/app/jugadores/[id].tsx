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
const RIVER_SHIELD_FALLBACK = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C_A_River_Plate.svg/1200px-Escudo_del_C_A_River_Plate.svg.png';

interface Gol {
  gol_id: number;
  gol_fecha: string;
  minutos: number;
  gol_parariver: number;
  gol_penal: number;
  es_gol_victoria?: boolean;
  tipo_gol_desc?: string;
  periodo_desc?: string;
  partido?: {
    go_ri: number;
    go_ad: number;
    rival: {
      ri_desc: string;
      ri_nombre?: string;
      escudo?: string;
    };
  };
}

interface Hito {
  fecha: string;
  goles_count: number;
  rival: string;
  rival_escudo?: string | null;
}

interface IntervalData {
  label: string;
  count: number;
  count_rival?: number;
}

interface PeriodStat {
  period_name: string;
  intervals: IntervalData[];
}

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  river_shield?: string | null;
  goles_count: number;
  goles_river_count: number;
  goles_rival_count: number;
  goles_victoria_count?: number | null;
  dias_desde_ultimo_gol?: number | null;
  partidos_desde_ultimo_gol?: number | null;
  goles_por_periodo?: PeriodStat[];
  dobletes_count: number;
  hat_tricks_count: number;
  dobletes: Hito[];
  hat_tricks: Hito[];
  goles: Gol[];
  goles_meta?: {
    current_page: number;
    last_page: number;
    total: number;
    river_goals_offset?: number;
  };
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

  const riverShieldUrl = jugador.river_shield || RIVER_SHIELD_FALLBACK;

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
                  style={[styles.avatarImage, !isPremium && styles.blurredAvatar]} 
                  contentFit="cover"
                  contentPosition="top center"
                  transition={500}
                />
              ) : (
                <Text style={styles.avatarText}>{jugador.pl_apno.charAt(0)}</Text>
              )}
              {!isPremium && (
                <View style={styles.premiumOverlaySmall}>
                   <Ionicons name="lock-closed" size={16} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
          </View>

          <View style={styles.badgeContainer}>
             <View style={styles.riverTag}><Text style={styles.riverTagText}>Registro Histórico</Text></View>
          </View>


          <Text style={styles.playerName}>{jugador.pl_apno}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.mainStat}>
              <Text style={styles.mainStatValue}>{jugador.goles_river_count}</Text>
              <Text style={styles.mainStatLabel}>Goles CARP</Text>
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

          <View style={styles.subStatsRow}>
             <Text style={styles.subStatText}>Goles Totales: <Text style={styles.subStatValue}>{jugador.goles_count}</Text></Text>
             <Text style={styles.subStatDivider}>|</Text>
             <Text style={styles.subStatText}>Goles Rival: <Text style={styles.subStatValue}>{jugador.goles_rival_count}</Text></Text>
          </View>

          {isPremium && (
            <View style={styles.winningGoalsBadge}>
               <MaterialCommunityIcons name="crown" size={14} color="#facc15" />
               <Text style={styles.winningGoalsText}>
                 Goles de la Victoria: <Text style={styles.winningGoalsValue}>{jugador.goles_victoria_count ?? 0}</Text>
               </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        
        {/* Hitos Goleadores - Exclusive Premium Section */}
        {(jugador.dobletes_count > 0 || jugador.hat_tricks_count > 0) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="trophy-variant" size={20} color="#dc2626" />
              <Text style={styles.sectionTitle}>Hall de Hitos (CARP)</Text>
              <View style={styles.premiumBadge}>
                 <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </View>

            <View style={styles.milestonesContainer}>
              {!isPremium && (
                <BlurView intensity={95} tint="light" style={styles.milestoneBlur}>
                   <View style={styles.lockContent}>
                      <Ionicons name="lock-closed" size={32} color="#dc2626" />
                      <Text style={styles.lockTitle}>Desbloquea Estadísticas</Text>
                      <TouchableOpacity 
                        style={styles.unlockButton}
                        onPress={() => router.push('/premium')}
                      >
                        <Text style={styles.unlockButtonText}>VER HITOS</Text>
                      </TouchableOpacity>
                   </View>
                </BlurView>
              )}

              {/* Hat Tricks Section */}
              <View style={styles.milestoneGroup}>
                <View style={styles.groupHeader}>
                  <MaterialCommunityIcons name="fire" size={16} color="#dc2626" />
                  <Text style={styles.groupTitle}>Hat-Tricks & Más</Text>
                  <Text style={styles.groupCount}>{jugador.hat_tricks_count}</Text>
                </View>
                {jugador.hat_tricks.map((hito, idx) => (
                  <View key={`ht-${idx}`} style={styles.hitoCardDark}>
                    <View style={styles.hitoInfo}>
                       <View style={styles.hitoCrestContainerDark}>
                          {hito.rival_escudo ? (
                            <Image source={{ uri: hito.rival_escudo }} style={styles.hitoCrest} />
                          ) : (
                            <MaterialCommunityIcons name="target" size={18} color="#475569" />
                          )}
                       </View>
                       <View>
                          <Text style={styles.hitoDateRed}>{formatLocalDate(hito.fecha)}</Text>
                          <Text style={styles.hitoRivalWhite}>vs {hito.rival}</Text>
                       </View>
                    </View>
                    <View style={styles.hitoCountCircle}>
                       <Text style={styles.hitoCountText}>{hito.goles_count}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Dobletes Section */}
              <View style={styles.milestoneGroup}>
                <View style={styles.groupHeader}>
                  <Ionicons name="star" size={14} color="#dc2626" />
                  <Text style={styles.groupTitle}>Dobletes</Text>
                  <Text style={styles.groupCount}>{jugador.dobletes_count}</Text>
                </View>
                {jugador.dobletes.map((hito, idx) => (
                  <View key={`db-${idx}`} style={styles.hitoCardLight}>
                    <View style={styles.hitoInfo}>
                       <View style={styles.hitoCrestContainerLight}>
                          {hito.rival_escudo ? (
                            <Image source={{ uri: hito.rival_escudo }} style={styles.hitoCrest} />
                          ) : (
                            <MaterialCommunityIcons name="target" size={18} color="#e2e8f0" />
                          )}
                       </View>
                       <View>
                          <Text style={styles.hitoDateRed}>{formatLocalDate(hito.fecha)}</Text>
                          <Text style={styles.hitoRivalDark}>vs {hito.rival}</Text>
                       </View>
                    </View>
                    <View style={styles.hitoCountCircleLight}>
                       <Text style={styles.hitoCountTextDark}>{hito.goles_count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Analytics Section - Intervals */}
        {isPremium && jugador.goles_por_periodo && jugador.goles_por_periodo.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#dc2626" />
              <Text style={styles.sectionTitle}>Análisis por Tiempo</Text>
            </View>
            
            <View style={styles.legendRow}>
               <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                  <Text style={styles.legendText}>Para River</Text>
               </View>
               <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
                  <Text style={styles.legendText}>Contra River</Text>
               </View>
            </View>

            {jugador.goles_por_periodo.map((period, idx) => (
              <View key={idx} style={styles.periodContainer}>
                <Text style={styles.periodLabel}>{period.period_name}</Text>
                {period.intervals.map((interval, iIdx) => {
                  const hasData = (interval.count || 0) > 0 || (interval.count_rival || 0) > 0;
                  if (!hasData) return null;

                  const maxVal = Math.max(...period.intervals.map(i => Math.max(i.count, i.count_rival || 0)));
                  const widthRiver = maxVal > 0 ? (interval.count / maxVal) * 100 : 0;
                  const widthRival = maxVal > 0 ? ((interval.count_rival || 0) / maxVal) * 100 : 0;

                  return (
                    <View key={iIdx} style={styles.intervalRow}>
                      <Text style={styles.intervalText}>{interval.label}</Text>
                      <View style={styles.barsContainer}>
                        {interval.count > 0 && (
                          <View style={styles.barWrapper}>
                            <View style={[styles.bar, { width: `${widthRiver}%`, backgroundColor: '#dc2626' }]} />
                            <Text style={styles.barValue}>{interval.count}</Text>
                          </View>
                        )}
                        {(interval.count_rival || 0) > 0 && (
                          <View style={styles.barWrapper}>
                            <View style={[styles.bar, { width: `${widthRival}%`, backgroundColor: '#94a3b8' }]} />
                            <Text style={styles.barValueRival}>{interval.count_rival}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="soccer" size={20} color="#dc2626" />
          <Text style={styles.sectionTitle}>Historial de Goles</Text>
        </View>

        {jugador.goles.map((gol, index) => {
          // Categorización Fina
          const isParaRiver = gol.gol_parariver === 1 && gol.gol_penal !== 6;
          const isAutogolCarp = gol.gol_parariver === 2 && gol.gol_penal === 6;
          const isAutogolRival = gol.gol_parariver === 1 && gol.gol_penal === 6;
          
          // Numbering goals for River (exclude own goals)
          const riverGoalsAhead = jugador.goles
            .slice(0, index)
            .filter(g => g.gol_parariver === 1 && g.gol_penal !== 6).length;
          
          const riverGoalsOffset = jugador.goles_meta?.river_goals_offset || 0;
          const riverGoalNumber = isParaRiver ? (jugador.goles_river_count - (riverGoalsOffset + riverGoalsAhead)) : null;

          return (
            <View key={index} style={[
              styles.goalCard, 
              !isParaRiver && styles.goalCardRival,
              isAutogolCarp && styles.goalCardAutogol,
              isAutogolRival && styles.goalCardBenefit
            ]}>
              <View style={styles.goalRival}>
                 <View style={[
                   styles.crestContainer, 
                   isAutogolCarp && styles.crestContainerAutogol,
                   isAutogolRival && styles.crestContainerBenefit
                 ]}>
                    {isParaRiver || isAutogolRival ? (
                      gol.partido?.rival?.escudo ? (
                        <Image source={{ uri: gol.partido.rival.escudo }} style={styles.crestImage} />
                      ) : (
                        <MaterialCommunityIcons name="shield-outline" size={24} color="#e2e8f0" />
                      )
                    ) : (
                      <Image source={{ uri: riverShieldUrl }} style={styles.crestImage} />
                    )}
                 </View>
                 <View style={styles.goalInfo}>
                    <View style={styles.goalTitleRow}>
                      <Text style={[
                        styles.goalNumber, 
                        !isParaRiver && styles.goalNumberRival,
                        isAutogolCarp && styles.goalNumberAutogol,
                        isAutogolRival && styles.goalNumberBenefit
                      ]}>
                        {isParaRiver ? `Gol #${riverGoalNumber}` : 
                         isAutogolCarp ? 'Autogol (CARP)' : 
                         isAutogolRival ? 'Beneficio CARP' : 'Anotación vs CARP'} • {formatLocalDate(gol.gol_fecha)}
                      </Text>
                      {gol.es_gol_victoria && (
                        <View style={styles.winnerBadgeSmall}>
                           <MaterialCommunityIcons name="crown" size={10} color="#fff" />
                           <Text style={styles.winnerBadgeText}>Victoria</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.rivalName, 
                      !isParaRiver && styles.rivalNameRival,
                      isAutogolCarp && styles.rivalNameAutogol,
                      isAutogolRival && styles.rivalNameBenefit
                    ]}>
                      {isParaRiver 
                        ? `vs ${gol.partido?.rival?.ri_desc}` 
                        : isAutogolCarp 
                          ? `En contra vs ${gol.partido?.rival?.ri_desc}`
                          : isAutogolRival
                            ? `Autogol Rival (con ${gol.partido?.rival?.ri_desc})`
                            : `vs River Plate (con ${gol.partido?.rival?.ri_desc})`
                      }
                    </Text>
                    <View style={[
                      styles.scoreTag, 
                      isAutogolCarp && styles.scoreTagAutogol,
                      isAutogolRival && styles.scoreTagBenefit
                    ]}>
                       <Text style={styles.scoreText}>{gol.partido?.go_ri} - {gol.partido?.go_ad}</Text>
                    </View>
                 </View>
              </View>
              <View style={styles.goalTime}>
                 <Text style={[
                   styles.timeText, 
                   !isParaRiver && styles.timeTextRival,
                   isAutogolCarp && styles.timeTextAutogol,
                   isAutogolRival && styles.timeTextBenefit
                 ]}>{gol.minutos}'</Text>
                 <Ionicons 
                   name={isAutogolCarp ? "alert-circle" : isAutogolRival ? "checkmark-circle" : "timer-outline"} 
                   size={14} 
                   color={isParaRiver ? "#94a3b8" : isAutogolCarp ? "#b45309" : isAutogolRival ? "#059669" : "#64748b"} 
                 />
              </View>
            </View>
          );
        })}

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
  blurredAvatar: {
    opacity: 0.3,
  },
  premiumOverlaySmall: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
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
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  subStatText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subStatValue: {
    color: '#94a3b8',
    fontWeight: '900',
  },
  subStatDivider: {
    color: '#334155',
    fontSize: 10,
  },
  winningGoalsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  winningGoalsText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  winningGoalsValue: {
    color: '#fff',
    fontWeight: '900',
  },
  content: {
    padding: 24,
  },
  sectionContainer: {
    marginBottom: 32,
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
  premiumBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  premiumBadgeText: {
    color: '#dc2626',
    fontSize: 8,
    fontWeight: '900',
  },
  milestonesContainer: {
    gap: 16,
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
  },
  milestoneBlur: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContent: {
    alignItems: 'center',
    gap: 8,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  unlockButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  milestoneGroup: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  groupCount: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hitoCardDark: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  hitoCardLight: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  hitoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  winnerBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  winnerBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hitoCrestContainerDark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitoCrestContainerLight: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  hitoCrest: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  hitoDateRed: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    textTransform: 'uppercase',
  },
  hitoRivalWhite: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
  hitoRivalDark: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  hitoCountCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  hitoCountCircleLight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hitoCountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  hitoCountTextDark: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  periodContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  intervalText: {
    width: 50,
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
  barsContainer: {
    flex: 1,
    gap: 4,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '900',
    color: '#dc2626',
    width: 20,
  },
  barValueRival: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    width: 20,
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
  goalCardRival: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    opacity: 0.9,
  },
  goalCardAutogol: {
    borderColor: '#fed7aa',
    backgroundColor: '#fffbeb',
  },
  goalCardBenefit: {
    borderColor: '#a7f3d0',
    backgroundColor: '#f0fdf4',
  },
  goalRival: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
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
  crestContainerAutogol: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  crestContainerBenefit: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  crestImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  goalInfo: {
    gap: 2,
    flex: 1,
  },
  goalNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    textTransform: 'uppercase',
  },
  goalNumberRival: {
    color: '#64748b',
  },
  goalNumberAutogol: {
    color: '#b45309',
  },
  goalNumberBenefit: {
    color: '#059669',
  },
  rivalName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  rivalNameRival: {
    color: '#475569',
  },
  rivalNameAutogol: {
    color: '#92400e',
  },
  rivalNameBenefit: {
    color: '#065f46',
  },
  scoreTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  scoreTagAutogol: {
    backgroundColor: '#fef3c7',
  },
  scoreTagBenefit: {
    backgroundColor: '#d1fae5',
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
  timeTextRival: {
    color: '#64748b',
  },
  timeTextAutogol: {
    color: '#b45309',
  },
  timeTextBenefit: {
    color: '#059669',
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
