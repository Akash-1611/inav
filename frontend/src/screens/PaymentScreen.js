import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { createPayment } from '../services/paymentService';

const PaymentScreen = ({ route, navigation }) => {
  const customer = route?.params?.customer;
  const [accountNumber, setAccountNumber] = useState(customer?.account_number || '');
  const [paymentAmount, setPaymentAmount] = useState(customer?.emi_due?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // Validation
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
        Alert.alert(
          'Payment Successful',
          `Payment of ₹${parseFloat(paymentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been processed successfully for account ${accountNumber}.`,
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
                navigation.goBack();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Payment Details</Title>
            <Paragraph style={styles.subtitle}>
              Enter your account number and payment amount to proceed
            </Paragraph>

            <TextInput
              label="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              style={styles.input}
              disabled={!!customer}
              autoCapitalize="none"
            />

            <TextInput
              label="Payment Amount (₹)"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Affix text="₹" />}
            />

            {customer && (
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  <Paragraph style={styles.infoText}>
                    <Text style={styles.infoLabel}>EMI Due: </Text>
                    ₹{parseFloat(customer.emi_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Paragraph>
                </Card.Content>
              </Card>
            )}

            <Button
              mode="contained"
              onPress={handlePayment}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Payment'}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  infoCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  infoText: {
    fontSize: 16,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
});

export default PaymentScreen;

