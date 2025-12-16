import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { ActivityIndicator, Text, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { getPaymentHistory } from '../services/paymentService';
import { format } from 'date-fns';

const PaymentHistoryScreen = ({ route, navigation }) => {
  const accountNumber = route?.params?.accountNumber || '';
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!accountNumber) {
      Alert.alert('Error', 'Account number is required');
      navigation.goBack();
      return;
    }

    try {
      const response = await getPaymentHistory(accountNumber);
      if (response.success) {
        setHistory(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch payment history. Please check your connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" animating={true} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  if (!history) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No payment history found</Text>
      </View>
    );
  }

  const { customer_details, payment_history } = history;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {customer_details && (
        <Card style={styles.customerCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Customer Details</Title>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Account Number:</Text>
              <Text style={styles.value}>{customer_details.account_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Issue Date:</Text>
              <Text style={styles.value}>
                {formatDate(customer_details.issue_date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Interest Rate:</Text>
              <Text style={styles.value}>{customer_details.interest_rate}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Tenure:</Text>
              <Text style={styles.value}>{customer_details.tenure} months</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>EMI Due:</Text>
              <Text style={[styles.value, styles.emiDue]}>
                {formatCurrency(customer_details.emi_due)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.historyCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            Payment History ({payment_history?.length || 0})
          </Title>
          {payment_history && payment_history.length > 0 ? (
            payment_history.map((payment, index) => (
              <View key={payment.id}>
                <View style={styles.paymentItem}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.payment_amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        payment.status === 'completed' && styles.statusCompleted,
                      ]}
                    >
                      <Text style={styles.statusText}>{payment.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentDate}>
                    {formatDate(payment.payment_date)}
                  </Text>
                  <Text style={styles.paymentId}>Payment ID: {payment.id}</Text>
                </View>
                {index < payment_history.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noPayments}>No payments found</Text>
          )}
        </Card.Content>
      </Card>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  customerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  historyCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  emiDue: {
    color: '#6200ee',
    fontSize: 16,
  },
  paymentItem: {
    paddingVertical: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  statusCompleted: {
    backgroundColor: '#c8e6c9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    textTransform: 'uppercase',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    marginTop: 12,
  },
  noPayments: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default PaymentHistoryScreen;

