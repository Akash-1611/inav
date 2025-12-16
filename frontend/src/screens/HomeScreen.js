import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { ActivityIndicator, Text, FAB } from 'react-native-paper';
import { getCustomers } from '../services/customerService';
import LoanCard from '../components/LoanCard';

const HomeScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      if (response.success) {
        setCustomers(response.data || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch customers. Please check your connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" animating={true} />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {customers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        ) : (
          customers.map((customer) => (
            <LoanCard
              key={customer.id}
              customer={customer}
              navigation={navigation}
            />
          ))
        )}
      </ScrollView>
      <FAB
        style={styles.fab}
        icon="plus"
        label="Make Payment"
        onPress={() => navigation.navigate('Payment')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;

