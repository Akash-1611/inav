import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, ActivityIndicator, IconButton } from 'react-native-paper';
import { createPayment } from '../services/paymentService';
import { theme } from '../theme';

const PaymentScreen = ({ route, navigation }) => {
  const customer = route?.params?.customer;
  const [accountNumber, setAccountNumber] = useState(customer?.account_number || '');
  const defaultAmount = customer?.remaining_emi && customer.remaining_emi > 0 
    ? customer.remaining_emi 
    : customer?.emi_due || '';
  const [paymentAmount, setPaymentAmount] = useState(defaultAmount?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your account number');
      return;
    }

    if (!paymentAmount.trim() || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment(accountNumber.trim(), parseFloat(paymentAmount));
      
      if (response.success) {
        const paymentData = response.data || {};
        const message = response.message || `Payment of ₹${parseFloat(paymentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been processed successfully.`;
        
        Alert.alert(
          '✅ Payment Successful',
          message + (paymentData.remaining_tenure !== undefined 
            ? `\n\nRemaining Tenure: ${paymentData.remaining_tenure} months` 
            : '') + (paymentData.next_emi_due !== undefined && paymentData.next_emi_due > 0
            ? `\nNext EMI Due: ₹${paymentData.next_emi_due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : ''),
          [
            {
              text: 'View History',
              onPress: () => {
                navigation.navigate('PaymentHistory', { accountNumber: accountNumber.trim() });
              },
            },
            {
              text: 'OK',
              onPress: () => {
                setAccountNumber('');
                setPaymentAmount('');
                // Navigate back and force refresh
                // Use a small delay to ensure payment is processed
                setTimeout(() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('Home');
                  }
                }, 100);
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', response.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>💳</Text>
          </View>
          <Title style={styles.headerTitle}>Make Payment</Title>
          <Paragraph style={styles.headerSubtitle}>
            Enter your account details to proceed with payment
          </Paragraph>
        </View>

        <Card style={styles.formCard} mode="elevated">
          <Card.Content>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                mode="outlined"
                style={styles.input}
                disabled={!!customer}
                autoCapitalize="none"
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="account" iconColor={theme.colors.textSecondary} />}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Payment Amount</Text>
              <TextInput
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="currency-inr" iconColor={theme.colors.textSecondary} />}
              />
            </View>

            {customer && (
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content style={styles.infoCardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      {customer.remaining_emi && customer.remaining_emi > 0 && customer.remaining_emi < customer.emi_due
                        ? 'Remaining EMI:'
                        : 'EMI Due:'}
                    </Text>
                    <Text style={styles.infoValue}>
                      {formatCurrency(customer.remaining_emi && customer.remaining_emi > 0 ? customer.remaining_emi : customer.emi_due)}
                    </Text>
                  </View>
                  {customer.remaining_emi && customer.remaining_emi > 0 && customer.remaining_emi < customer.emi_due && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Full EMI:</Text>
                      <Text style={styles.infoValueSmall}>
                        {formatCurrency(customer.emi_due)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Remaining Tenure:</Text>
                    <Text style={styles.infoValueSmall}>
                      {customer.tenure} months
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <Button
              mode="contained"
              onPress={handlePayment}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
              loading={loading}
              disabled={loading}
              icon="check-circle"
            >
              {loading ? 'Processing Payment...' : 'Confirm Payment'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  infoCard: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  infoCardContent: {
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  infoValueSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
});

export default PaymentScreen;
