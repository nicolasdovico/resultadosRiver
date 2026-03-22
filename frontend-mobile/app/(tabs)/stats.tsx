import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      data: [75, 70, 62, 78, 65, 68],
      color: (opacity = 1) => `rgba(185, 28, 28, ${opacity})`,
      strokeWidth: 2
    }
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(185, 28, 28, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Efectividad Anual</Text>
        <LineChart
          data={data}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Goles por Competencia</Text>
        <PieChart
          data={[
            { name: 'Libertadores', population: 45, color: '#b91c1c', legendFontColor: '#7f7f7f', legendFontSize: 12 },
            { name: 'Liga Nac.', population: 120, color: '#dc2626', legendFontColor: '#7f7f7f', legendFontSize: 12 },
            { name: 'Copa Arg.', population: 30, color: '#ef4444', legendFontColor: '#7f7f7f', legendFontSize: 12 },
          ]}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
