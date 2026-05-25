import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ReportData {
  success: boolean;
  summary: {
    total?: number;
    completed?: number;
    pending?: number;
    cancelled?: number;
    totalAmount?: number;
    successRate?: number;
    totalWinners?: number;
    totalUsers?: number;
    activeUsers?: number;
  };
}

export default function ReportsSummaryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersReport, setOrdersReport] = useState<ReportData | null>(null);
  const [paymentsReport, setPaymentsReport] = useState<ReportData | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [orders, payments] = await Promise.all([
        fetch('https://your-api.com/api/reports/orders').then(r => r.json()),
        fetch('https://your-api.com/api/reports/payments').then(r => r.json()),
      ]);

      setOrdersReport(orders);
      setPaymentsReport(payments);
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحميل التقارير');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>جاري تحميل التقارير...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>📊 ملخص التقارير</Text>

      {/* بطاقة الطلبات */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 الطلبات</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>إجمالي الطلبات:</Text>
          <Text style={styles.statValue}>{ordersReport?.summary?.total || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>✅ مكتملة:</Text>
          <Text style={[styles.statValue, styles.success]}>
            {ordersReport?.summary?.completed || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>⏳ قيد الانتظار:</Text>
          <Text style={[styles.statValue, styles.warning]}>
            {ordersReport?.summary?.pending || 0}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>❌ ملغاة:</Text>
          <Text style={[styles.statValue, styles.error]}>
            {ordersReport?.summary?.cancelled || 0}
          </Text>
        </View>
      </View>

      {/* بطاقة المدفوعات */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 المدفوعات</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>إجمالي المبيعات:</Text>
          <Text style={styles.statValue}>
            {(paymentsReport?.summary?.totalAmount || 0).toLocaleString()} جنيه
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>نسبة النجاح:</Text>
          <Text style={[styles.statValue, styles.success]}>
            {paymentsReport?.summary?.successRate || 0}%
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>عدد المعاملات:</Text>
          <Text style={styles.statValue}>{paymentsReport?.summary?.total || 0}</Text>
        </View>
      </View>

      {/* زر التحديث */}
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>🔄 تحديث البيانات</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  success: {
    color: '#4caf50',
  },
  warning: {
    color: '#ff9800',
  },
  error: {
    color: '#f44336',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  spacer: {
    height: 40,
  },
});
