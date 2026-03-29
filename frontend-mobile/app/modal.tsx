import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPartidoByFecha } from '@/api/generated/endpoints/partidos/partidos';
import type { PartidoResource as Partido } from '@/api/generated/model/partidoResource';
import { formatLocalDate } from '@/utils/date';

const RIVER_SHIELD = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C_A_River_Plate.svg/1200px-Escudo_del_C_A_River_Plate.svg.png';

export default function PartidoModal() {
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (fecha) {
      fetchDetails();
    }
  }, [fecha]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getPartidoByFecha(fecha as string);
      setPartido((response as any).data || null);
    } catch (error) {
      console.error('Error fetching partido details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  if (!partido) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró información del partido</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTorneo}>{partido.torneo?.tor_desc}</Text>
          <Text style={styles.headerFecha}>{formatLocalDate(partido.fecha || '')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Marcador */}
        <View style={styles.scoreCard}>
          <View style={styles.teamContainer}>
            <Image 
              source={{ uri: RIVER_SHIELD }} 
              style={styles.largeShield} 
              contentFit="contain"
              transition={200}
            />
            <Text style={styles.teamName}>River Plate</Text>
          </View>

          <View style={styles.scoreValueContainer}>
            <Text style={styles.scoreValue}>{partido.goles_river} - {partido.goles_rival}</Text>
            <View style={[styles.resultBadge, 
              partido.resultado === 'G' ? styles.winBadge : 
              partido.resultado === 'P' ? styles.lossBadge : styles.drawBadge
            ]}>
              <Text style={styles.resultText}>
                {partido.resultado === 'G' ? 'Ganó' : partido.resultado === 'P' ? 'Perdió' : 'Empató'}
              </Text>
            </View>
          </View>

          <View style={styles.teamContainer}>
            <Image 
              source={{ uri: partido.rival?.escudo_url || 'https://via.placeholder.com/80?text=R' }} 
              style={styles.largeShield} 
              contentFit="contain"
              placeholder={'https://via.placeholder.com/80?text=R'}
              transition={200}
              onError={(e) => console.log(`Error loading modal shield for ${partido.rival?.ri_desc}:`, e.error, 'URL:', partido.rival?.escudo_url)}
              onLoad={() => console.log(`Successfully loaded modal shield for ${partido.rival?.ri_desc}`)}
            />
            <Text style={styles.teamName}>{partido.rival?.ri_desc}</Text>
          </View>
        </View>

        {/* Detalles */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#64748b" />
            <View>
              <Text style={styles.detailLabel}>Estadio</Text>
              <Text style={styles.detailValue}>{partido.estadio?.es_desc || 'No informado'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="whistle-outline" size={20} color="#64748b" />
            <View>
              <Text style={styles.detailLabel}>Árbitro</Text>
              <Text style={styles.detailValue}>{partido.arbitro?.ar_desc || 'No informado'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color="#64748b" />
            <View>
              <Text style={styles.detailLabel}>Condición</Text>
              <Text style={styles.detailValue}>{partido.condicion?.con_desc || 'No informado'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <FontAwesome5 name="user-tie" size={18} color="#64748b" />
            <View>
              <Text style={styles.detailLabel}>DT River</Text>
              <Text style={styles.detailValue}>{partido.tecnico?.te_desc || 'No informado'}</Text>
            </View>
          </View>
        </View>

        {/* Goles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goles</Text>
          {partido.goles && partido.goles.length > 0 ? (
            partido.goles.map((gol, index) => (
              <View key={index} style={styles.golRow}>
                <Ionicons name="football" size={16} color="#0f172a" />
                <Text style={styles.golText}>
                  <Text style={styles.golMinuto}>{gol.minutos}' </Text>
                  <Text style={styles.golJugador}>{gol.jugador?.ju_desc || 'Goleador'}</Text>
                  <Text style={styles.golTipo}> ({gol.tipo_gol_rel?.tg_desc})</Text>
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay información de goles</Text>
          )}
        </View>

        {/* Observaciones */}
        {partido.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <View style={styles.obsCard}>
              <Text style={styles.obsText}>{partido.observaciones}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    padding: 4,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTorneo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444',
    textTransform: 'uppercase',
  },
  headerFecha: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  largeShield: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  scoreValueContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  winBadge: { backgroundColor: '#dcfce7' },
  lossBadge: { backgroundColor: '#fee2e2' },
  drawBadge: { backgroundColor: '#f1f5f9' },
  resultText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#0f172a',
  },
  detailsGrid: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  golRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  golText: {
    fontSize: 14,
    color: '#1e293b',
  },
  golMinuto: {
    fontWeight: '800',
    color: '#ef4444',
  },
  golJugador: {
    fontWeight: '700',
  },
  golTipo: {
    color: '#64748b',
    fontSize: 12,
  },
  obsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  obsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#b91c1c',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
