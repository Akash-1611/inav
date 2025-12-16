import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { theme } from '../theme';

const LoanCard = ({ customer, navigation }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Parse amounts properly - ensure we handle numbers correctly
  const remainingEmi = customer.remaining_emi != null && customer.remaining_emi !== undefined 
    ? parseFloat(customer.remaining_emi) 
    : null;
  const emiDue = parseFloat(customer.emi_due);
  
  // Get the amount to display
  // If remaining_emi exists, is > 0, and is different from emi_due, show remaining_emi
  // Otherwise show emi_due (full EMI due)
  // Note: If remaining_emi equals emi_due, it means full EMI is due (no partial payment)
  const displayAmount = (remainingEmi !== null && remainingEmi > 0 && remainingEmi < emiDue) 
    ? remainingEmi 
    : emiDue;
  
  // Show "Remaining EMI" label only if remaining_emi is less than emi_due (partial payment)
  const showRemaining = remainingEmi !== null && remainingEmi > 0 && remainingEmi < emiDue;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PaymentHistory', { accountNumber: customer.account_number })}
    >
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.accountInfo}>
            <View style={styles.accountIcon}>
              <Text style={styles.accountIconText}>
                {customer.account_number.charAt(customer.account_number.length - 1)}
              </Text>
            </View>
            <View>
              <Text style={styles.accountLabel}>Account Number</Text>
              <Text style={styles.accountNumber}>{customer.account_number}</Text>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => navigation.navigate('PaymentHistory', { accountNumber: customer.account_number })}
          />
        </View>

        <Card.Content style={styles.cardContent}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Issue Date</Text>
              <Text style={styles.detailValue}>{formatDate(customer.issue_date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>{customer.interest_rate}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tenure</Text>
              <Text style={styles.detailValue}>{customer.tenure} months</Text>
            </View>
          </View>

          <View style={styles.emiSection}>
            <View style={styles.emiContainer}>
              <Text style={styles.emiLabel}>
                {showRemaining ? 'Remaining EMI' : 'EMI Due'}
              </Text>
              <Text style={styles.emiAmount}>
                {formatCurrency(displayAmount)}
              </Text>
            </View>
            {showRemaining && (
              <View style={styles.remainingInfo}>
                <Text style={styles.remainingText}>
                  Full EMI: {formatCurrency(emiDue)}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Payment', { customer })}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
            labelStyle={styles.payButtonLabel}
            icon="credit-card"
          >
            Pay Now
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PaymentHistory', { accountNumber: customer.account_number })}
            style={styles.historyButton}
            contentStyle={styles.historyButtonContent}
            labelStyle={styles.historyButtonLabel}
            icon="history"
          >
            History
          </Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  accountLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  cardContent: {
    paddingTop: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    marginTop: 8,
  },
  emiContainer: {
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
  remainingInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  remainingText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  payButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  payButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  historyButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.primary,
  },
  historyButtonContent: {
    paddingVertical: 8,
  },
  historyButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default LoanCard;
