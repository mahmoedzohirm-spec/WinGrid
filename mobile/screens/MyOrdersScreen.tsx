import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';

const MyOrdersScreen = () => {
  const { user } = useAuthStore();
  const { orders, loading, fetchUserOrders, uploadReceipt } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrders(user.id);
    }
  }, [user]);

  const handlePickImage = async (orderId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploading(true);

        const fileName = asset.uri.split('/').pop() || `receipt_${Date.now()}.jpg`;

        await uploadReceipt(orderId, asset.uri, fileName);

        Alert.alert('نجح', 'تم رفع الإيصال بنجاح');
        setSelectedOrder(null);
      }
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل رفع الإيصال');
    } finally {
      setUploading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>لا توجد طلبات حالياً</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طلباتي</Text>
        <Text style={styles.headerSubtitle}>{orders.length} طلب</Text>
      </View>

      <FlatList
        data={orders}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item: order }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>الطلب #{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderDetails}>
              <Text style={styles.detailLabel}>عدد البطاقات:</Text>
              <Text style={styles.detailValue}>{order.items.length}</Text>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.detailLabel}>المبلغ الإجمالي:</Text>
              <Text style={styles.detailValue}>{order.totalAmount.toFixed(2)} ر.س</Text>
            </View>

            {order.receiptUrl && (
              <View style={styles.orderDetails}>
                <Text style={styles.detailLabel}>الإيصال:</Text>
                <Text style={styles.receiptName}>✓ {order.receiptFileName}</Text>
              </View>
            )}

            {order.status === 'pending' && !order.receiptUrl && (
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.uploadButtonDisabled,
                ]}
                onPress={() => handlePickImage(order.id)}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>رفع الإيصال</Text>
                )}
              </TouchableOpacity>
            )}

            {selectedOrder === order.id && (
              <View style={styles.expandedDetails}>
                <Text style={styles.expandedTitle}>تفاصيل الطلب</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemLabel}>
                      البطاقة {idx + 1}:
                    </Text>
                    <Text style={styles.itemValue}>
                      {item.quantity}x {item.price.toFixed(2)} ر.س
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.expandButton}
              onPress={() =>
                setSelectedOrder(
                  selectedOrder === order.id ? null : order.id
                )
              }
            >
              <Text style={styles.expandButtonText}>
                {selectedOrder === order.id ? '▼ إخفاء التفاصيل' : '▶ عرض التفاصيل'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  receiptName: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  expandedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 12,
    color: '#999',
  },
  itemValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  expandButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default MyOrdersScreen;
