import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { format } from 'date-fns';

const LoanCard = ({ customer, onMakePayment, onViewHistory, navigation }) => {
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

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Title style={styles.accountNumber}>{customer.account_number}</Title>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Issue Date:</Paragraph>
            <Paragraph style={styles.value}>{formatDate(customer.issue_date)}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Interest Rate:</Paragraph>
            <Paragraph style={styles.value}>{customer.interest_rate}%</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Tenure:</Paragraph>
            <Paragraph style={styles.value}>{customer.tenure} months</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>EMI Due:</Paragraph>
            <Paragraph style={[styles.value, styles.emiDue]}>
              {formatCurrency(customer.emi_due)}
            </Paragraph>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Payment', { customer })}
          style={styles.button}
        >
          Make Payment
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('PaymentHistory', { accountNumber: customer.account_number })}
          style={styles.button}
        >
          History
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 4,
  },
  accountNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee',
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
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
  actions: {
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default LoanCard;

