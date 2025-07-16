import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { supportService, FAQItem } from '@/services/supportService';

export default function FAQScreen() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'general', label: 'General' },
    { key: 'account', label: 'Account' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'technical', label: 'Technical' },
    { key: 'privacy', label: 'Privacy' },
  ];

  useEffect(() => {
    loadFAQ();
  }, []);

  useEffect(() => {
    filterFAQ();
  }, [faqItems, searchQuery, selectedCategory]);

  const loadFAQ = async () => {
    try {
      const items = await supportService.getFAQByCategory();
      setFaqItems(items);
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFAQ = async () => {
    let filtered = faqItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = await supportService.searchFAQ(searchQuery);
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }

    setFilteredItems(filtered);
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleFeedback = async (faqId: string, helpful: boolean) => {
    try {
      await supportService.submitFAQFeedback(faqId, helpful);
      Alert.alert(
        'Thank you!',
        helpful ? 'Glad this was helpful!' : 'We\'ll work on improving this answer.',
        [{ text: 'OK' }]
      );
      
      // Reload FAQ to show updated counts
      loadFAQ();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <Text style={styles.faqQuestion}>{item.question}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textMedium} />
          ) : (
            <ChevronDown size={20} color={COLORS.textMedium} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
            
            <View style={styles.faqFooter}>
              <Text style={styles.helpfulText}>Was this helpful?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={() => handleFeedback(item.id, true)}
                >
                  <ThumbsUp size={16} color={COLORS.success} />
                  <Text style={styles.feedbackCount}>{item.helpful}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={() => handleFeedback(item.id, false)}
                >
                  <ThumbsDown size={16} color={COLORS.error} />
                  <Text style={styles.feedbackCount}>{item.notHelpful}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMedium}
          />
        </View>
      </View>

      {renderCategoryFilter()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading FAQ...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No FAQ items found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search terms' : 'No items in this category'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
            </Text>
            {filteredItems.map(renderFAQItem)}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Can't find what you're looking for?
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/support/contact')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.textDark,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textDark,
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.textDark,
  },
  categoryTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
    marginVertical: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 12,
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  faqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.textDark,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  feedbackCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.textMedium,
    marginLeft: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});
