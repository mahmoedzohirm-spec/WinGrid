import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [ordersReport, setOrdersReport] = useState<any>(null);
  const [paymentsReport, setPaymentsReport] = useState<any>(null);
  const [winnersReport, setWinnersReport] = useState<any>(null);
  const [usersReport, setUsersReport] = useState<any>(null);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    orderStatus: '',
    paymentStatus: '',
  });

  // تحميل التقارير الشاملة
  const fetchReports = async () => {
    setLoading(true);
    try {
      const [orders, payments, winners, users] = await Promise.all([
        fetch(
          `/api/reports/orders${buildQueryString(filters)}`
        ).then(r => r.json()),
        fetch(
          `/api/reports/payments${buildQueryString(filters)}`
        ).then(r => r.json()),
        fetch('/api/reports/winners').then(r => r.json()),
        fetch('/api/reports/users').then(r => r.json()),
      ]);

      setOrdersReport(orders);
      setPaymentsReport(payments);
      setWinnersReport(winners);
      setUsersReport(users);
    } catch (error) {
      console.error('خطأ في تحميل التقارير:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildQueryString = (obj: any) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]: any) => {
      if (value) params.append(key, value);
    });
    return params.toString() ? `?${params.toString()}` : '';
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await fetch(
        `/api/reports/orders/export/csv${buildQueryString(filters)}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-report-${new Date().toISOString()}.csv`;
      link.click();
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        📊 لوحة التقارير المتقدمة
      </Typography>

      {/* قسم الفلاتر */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🔍 الفلاتر
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="من التاريخ"
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="إلى التاريخ"
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>حالة الطلب</InputLabel>
              <Select
                value={filters.orderStatus}
                label="حالة الطلب"
                onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="pending">قيد الانتظار</MenuItem>
                <MenuItem value="completed">مكتمل</MenuItem>
                <MenuItem value="cancelled">ملغي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchReports}
              sx={{ mt: 1 }}
            >
              تحديث البيانات
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* بطاقات الملخص الرئيسي */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* الطلبات */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                📦 إجمالي الطلبات
              </Typography>
              <Typography variant="h5">
                {ordersReport?.summary?.total || 0}
              </Typography>
              <Typography variant="body2" color="success.main">
                ✅ مكتملة: {ordersReport?.summary?.completed || 0}
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⏳ قيد الانتظار: {ordersReport?.summary?.pending || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* المبيعات */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                💰 إجمالي المبيعات
              </Typography>
              <Typography variant="h5">
                {paymentsReport?.summary?.totalAmount?.toLocaleString() || 0} جنيه
              </Typography>
              <Typography variant="body2" color="success.main">
                ✅ ناجحة: {paymentsReport?.summary?.successful || 0}
              </Typography>
              <Typography variant="body2">
                نسبة النجاح: {paymentsReport?.summary?.successRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* الفائزون */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                🏆 إجمالي الفائزين
              </Typography>
              <Typography variant="h5">
                {winnersReport?.summary?.totalWinners || 0}
              </Typography>
              <Typography variant="body2">
                إجمالي الجوائز: {winnersReport?.summary?.totalPrizeAmount?.toLocaleString() || 0} جنيه
              </Typography>
              <Typography variant="body2" color="info.main">
                متوسط الجائزة: {winnersReport?.summary?.averagePrizePerWinner || 0} جنيه
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* المستخدمون */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                👥 إجمالي المستخدمين
              </Typography>
              <Typography variant="h5">
                {usersReport?.summary?.totalUsers || 0}
              </Typography>
              <Typography variant="body2">
                نشطين: {usersReport?.summary?.activeUsers || 0}
              </Typography>
              <Typography variant="body2" color="error.main">
                غير نشطين: {usersReport?.summary?.inactiveUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* الرسوم البيانية */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* رسم بياني حالات الطلبات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 توزيع حالات الطلبات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'مكتملة', value: ordersReport?.summary?.completed || 0 },
                      { name: 'قيد الانتظار', value: ordersReport?.summary?.pending || 0 },
                      { name: 'ملغاة', value: ordersReport?.summary?.cancelled || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* رسم بياني حالات المدفوعات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                💳 حالات المدفوعات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'ناجحة', value: paymentsReport?.summary?.successful || 0 },
                    { name: 'فاشلة', value: paymentsReport?.summary?.failed || 0 },
                    { name: 'قيد الانتظار', value: paymentsReport?.summary?.pending || 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* زر التصدير */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          color="success"
        >
          📥 تصدير الطلبات إلى CSV
        </Button>
      </Box>

      {/* جداول التفاصيل */}
      <Grid container spacing={3}>
        {/* جدول آخر الطلبات */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📋 آخر 10 طلبات
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>ID</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>المستخدم</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>المبلغ</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>الحالة</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersReport?.orders?.slice(0, 10).map((order: any) => (
                      <tr key={order.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{order.id}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{order.user_id}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          {order.total_amount?.toLocaleString()} جنيه
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: order.status === 'completed' ? '#4caf50' : order.status === 'pending' ? '#ff9800' : '#f44336',
                            color: 'white',
                            fontSize: '12px',
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                          {new Date(order.created_at).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
