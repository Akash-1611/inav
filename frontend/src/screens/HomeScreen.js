import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Text } from 'react-native';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getCustomers } from '../services/customerService';
import LoanCard from '../components/LoanCard';
import { theme } from '../theme';

const HomeScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstMount = useRef(true);

  const fetchCustomers = useCallback(async () => {
    try {
      console.log('Fetching customers...');
      const response = await getCustomers();
      if (response.success) {
        console.log('Customers fetched:', response.data?.length || 0);
        // Log first customer's remaining_emi for debugging
        if (response.data && response.data.length > 0) {
          console.log('First customer remaining_emi:', response.data[0].remaining_emi, 'emi_due:', response.data[0].emi_due);
        }
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
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Refresh data when screen comes into focus (e.g., after returning from payment screen)
  useFocusEffect(
    useCallback(() => {
      // Skip refresh on initial mount - useEffect handles that
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      
      // Always refresh when screen gains focus (after returning from other screens)
      // Use a small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        console.log('HomeScreen focused - refreshing data...');
        setRefreshing(true);
        fetchCustomers();
      }, 200);
      
      return () => clearTimeout(timer);
    }, [fetchCustomers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Loans</Text>
          <Text style={styles.headerSubtitle}>
            {customers.length} {customers.length === 1 ? 'account' : 'accounts'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {customers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No Loans Found</Text>
            <Text style={styles.emptyText}>
              You don't have any active loans at the moment.
            </Text>
          </View>
        ) : (
          <>
            {customers.map((customer) => (
              <LoanCard
                key={`${customer.id}-${customer.remaining_emi}-${customer.tenure}`}
                customer={customer}
                navigation={navigation}
              />
            ))}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Payment"
        onPress={() => navigation.navigate('Payment')}
        color={theme.colors.onPrimary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.lg,
  },
  headerContent: {
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
});

export default HomeScreen;
