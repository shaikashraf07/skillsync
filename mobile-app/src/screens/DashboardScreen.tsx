import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export interface Posting {
  id: string;
  title: string;
  type: 'INTERNSHIP' | 'PROJECT';
  description: string;
  stipend?: number;
  duration?: string;
  location?: string;
  deadline: string;
  postingSkills: { skillName: string; weight: number }[];
}

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPostings = async () => {
    try {
      const res = await apiClient.get('/api/postings');
      setPostings(res.data);
    } catch (e) {
      console.error('Failed to fetch postings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostings();
  };

  const renderPostingCard = ({ item }: { item: Posting }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EligibilityCheck', { posting: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, item.type === 'INTERNSHIP' ? styles.badgeInternship : styles.badgeProject]}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.skillRow}>
        {item.postingSkills?.slice(0, 3).map((ps, idx) => (
          <View key={idx} style={styles.skillTag}>
            <Text style={styles.skillTagText}>{ps.skillName}</Text>
          </View>
        ))}
        {item.postingSkills?.length > 3 && (
          <Text style={styles.moreSkills}>+{item.postingSkills.length - 3}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>
          {item.stipend ? `₹${item.stipend}/mo` : item.location || 'Remote'}
        </Text>
        <TouchableOpacity
          style={styles.checkBtn}
          onPress={() => navigation.navigate('EligibilityCheck', { posting: item })}
        >
          <Text style={styles.checkBtnText}>Check Score ➔</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.userGreeting}>Hello, {user?.email.split('@')[0]}</Text>
          <Text style={styles.headerSub}>Find matching opportunities</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={postings}
          keyExtractor={(item) => item.id}
          renderItem={renderPostingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active postings available right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  userGreeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  logoutBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.cardBorder,
  },
  logoutBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  badgeInternship: {
    backgroundColor: '#1E3A8A',
  },
  badgeProject: {
    backgroundColor: '#4C1D95',
  },
  badgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  skillTagText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  moreSkills: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    paddingTop: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  checkBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
