import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Text } from 'react-native';
import { ActivityIndicator, Card, Title, Paragraph, Divider, Chip } from 'react-native-paper';
import { getPaymentHistory } from '../services/paymentService';
import { format } from 'date-fns';
import { theme } from '../theme';

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
        <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
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
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {customer_details && (
        <Card style={styles.customerCard} mode="elevated">
          <View style={styles.customerCardHeader}>
            <View style={styles.accountIcon}>
              <Text style={styles.accountIconText}>
                {customer_details.account_number.charAt(customer_details.account_number.length - 1)}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Account Number</Text>
              <Text style={styles.accountNumber}>{customer_details.account_number}</Text>
            </View>
          </View>
          <Card.Content>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Issue Date</Text>
                <Text style={styles.detailValue}>{formatDate(customer_details.issue_date)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Interest Rate</Text>
                <Text style={styles.detailValue}>{customer_details.interest_rate}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tenure</Text>
                <Text style={styles.detailValue}>{customer_details.tenure} months</Text>
              </View>
            </View>
            <View style={styles.emiSection}>
              <Text style={styles.emiLabel}>EMI Due</Text>
              <Text style={styles.emiAmount}>{formatCurrency(customer_details.emi_due)}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.historyCard} mode="elevated">
        <Card.Content>
          <View style={styles.historyHeader}>
            <Title style={styles.cardTitle}>Payment History</Title>
            <Chip
              icon="history"
              style={styles.countChip}
              textStyle={styles.countChipText}
            >
              {payment_history?.length || 0}
            </Chip>
          </View>
          {payment_history && payment_history.length > 0 ? (
            payment_history.map((payment, index) => (
              <View key={payment.id}>
                <View style={styles.paymentItem}>
                  <View style={styles.paymentLeft}>
                    <View style={styles.paymentIcon}>
                      <Text style={styles.paymentIconText}>✓</Text>
                    </View>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.payment_amount)}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.payment_date)}
                      </Text>
                      <Text style={styles.paymentId}>Transaction ID: {payment.id}</Text>
                    </View>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      payment.status === 'completed' && styles.statusChipCompleted,
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      payment.status === 'completed' && styles.statusChipTextCompleted,
                    ]}
                    icon="check-circle"
                  >
                    {payment.status}
                  </Chip>
                </View>
                {index < payment_history.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.noPaymentsContainer}>
              <Text style={styles.noPaymentsIcon}>📋</Text>
              <Text style={styles.noPayments}>No payments found</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  customerCard: {
    marginBottom: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  customerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emiSection: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emiLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emiAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  historyCard: {
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  countChip: {
    backgroundColor: theme.colors.primaryLight,
  },
  countChipText: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  paymentId: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  statusChip: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  statusChipCompleted: {
    backgroundColor: theme.colors.success + '20',
  },
  statusChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusChipTextCompleted: {
    color: theme.colors.success,
  },
  divider: {
    marginTop: 8,
    backgroundColor: theme.colors.border,
  },
  noPaymentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPaymentsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPayments: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default PaymentHistoryScreen;
