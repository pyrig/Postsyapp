import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, TrendingUp, Hash, Filter, Globe, Plus } from 'lucide-react-native';
import { EchoCard } from '@/components/EchoCard';
import { TrendingTopics } from '@/components/TrendingTopics';
import { useEchos } from '@/hooks/useEchos';
import { useHashtags } from '@/hooks/useHashtags';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'location' | 'hashtag' | 'global'>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { echos, refreshEchos } = useEchos();
  const { trendingTopics, searchHashtags, addToSearchHistory, searchHistory } = useHashtags();

  const popularLocations = [
    'Campus Area',
    'Downtown',
    'Coffee District',
    'Beach Area',
    'University Square',
    'Park Central',
    'Library District',
    'Arts Quarter',
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEchos();
    setRefreshing(false);
  };

  const handleHashtagPress = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setSelectedLocation(null);
    setSearchQuery(hashtag);
    setSearchMode('hashtag');
    addToSearchHistory(hashtag);
  };

  const handleLocationPress = (location: string) => {
    setSelectedLocation(selectedLocation === location ? null : location);
    setSelectedHashtag(null);
    setSearchMode('location');
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.startsWith('#')) {
      setSearchMode('hashtag');
      setSelectedLocation(null);
    } else if (text.trim() === '') {
      setSearchMode('global');
      setSelectedHashtag(null);
      setSelectedLocation(null);
    } else {
      setSearchMode('location');
      setSelectedHashtag(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedHashtag(null);
    setSelectedLocation(null);
    setSearchMode('global');
  };

  const filteredEchos = echos.filter(echo => {
    if (searchMode === 'hashtag' && selectedHashtag) {
      return echo.content.toLowerCase().includes(selectedHashtag.toLowerCase());
    }
    
    if (searchMode === 'location') {
      const matchesSearch = searchQuery ? 
        echo.location.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchesLocation = selectedLocation ? 
        echo.location === selectedLocation : true;
      return matchesSearch && matchesLocation;
    }
    
    if (searchMode === 'global' && searchQuery) {
      return echo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             echo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
             echo.pseudonym.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const searchResults = searchMode === 'hashtag' && searchQuery.startsWith('#') 
    ? searchHashtags(searchQuery) 
    : [];

  const getSearchModeIcon = () => {
    switch (searchMode) {
      case 'hashtag': return <Hash size={16} color="#00FFFF" />;
      case 'location': return <MapPin size={16} color="#00FFFF" />;
      default: return <Globe size={16} color="#00FFFF" />;
    }
  };

  const getSearchModeText = () => {
    switch (searchMode) {
      case 'hashtag': return 'Hashtag Search';
      case 'location': return 'Location Search';
      default: return 'Global Search';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover stories and trending topics</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories, locations, or #hashtags..."
            placeholderTextColor="#718096"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSearch}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Search Mode Indicator */}
        {searchQuery.length > 0 && (
          <View style={styles.searchModeIndicator}>
            {getSearchModeIcon()}
            <Text style={styles.searchModeText}>{getSearchModeText()}</Text>
          </View>
        )}

        {/* Search Results for Hashtags */}
        {searchMode === 'hashtag' && searchQuery.length > 1 && (
          <View style={styles.searchResults}>
            {searchResults.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {searchResults.map((hashtag) => (
                  <TouchableOpacity
                    key={hashtag.id}
                    style={[
                      styles.hashtagResult,
                      selectedHashtag === hashtag.tag && styles.hashtagResultActive
                    ]}
                    onPress={() => handleHashtagPress(hashtag.tag)}
                  >
                    <Hash size={14} color={selectedHashtag === hashtag.tag ? '#1A202C' : '#00FFFF'} />
                    <Text style={[
                      styles.hashtagResultText,
                      selectedHashtag === hashtag.tag && styles.hashtagResultTextActive
                    ]}>
                      {hashtag.tag.replace('#', '')}
                    </Text>
                    <View style={[
                      styles.hashtagCount,
                      selectedHashtag === hashtag.tag && styles.hashtagCountActive
                    ]}>
                      <Text style={[
                        styles.hashtagCountText,
                        selectedHashtag === hashtag.tag && styles.hashtagCountTextActive
                      ]}>
                        {hashtag.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noResults}>No hashtags found</Text>
            )}
          </View>
        )}

        {/* Recent Searches */}
        {searchQuery === '' && searchHistory.length > 0 && (
          <View style={styles.recentSearches}>
            <Text style={styles.recentTitle}>Recent searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {searchHistory.map((hashtag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleHashtagPress(hashtag)}
                >
                  <Hash size={12} color="#718096" />
                  <Text style={styles.recentText}>{hashtag.replace('#', '')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Trending Topics */}
        {searchMode === 'global' && (
          <View style={styles.contentSection}>
            <TrendingTopics 
              topics={trendingTopics} 
              onHashtagPress={handleHashtagPress}
            />
          </View>
        )}

        {/* Location Tags (only show when not in hashtag mode and filters are shown) */}
        {(searchMode === 'location' || showFilters) && (
          <View style={styles.locationsSection}>
            <Text style={styles.sectionTitle}>Popular Locations</Text>
            <View style={styles.locationTags}>
              {popularLocations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationTag,
                    selectedLocation === location && styles.locationTagActive
                  ]}
                  onPress={() => handleLocationPress(location)}
                >
                  <MapPin size={14} color={selectedLocation === location ? '#1A202C' : '#E2E8F0'} />
                  <Text style={[
                    styles.locationTagText,
                    selectedLocation === location && styles.locationTagTextActive
                  ]}>
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.echoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedHashtag 
                ? `Stories with ${selectedHashtag}` 
                : selectedLocation 
                  ? `Stories from ${selectedLocation}` 
                  : searchQuery
                    ? `Search results for "${searchQuery}"`
                    : 'All Stories'
              }
            </Text>
            <View style={styles.echoCount}>
              <TrendingUp size={16} color="#00FFFF" />
              <Text style={styles.echoCountText}>{filteredEchos.length}</Text>
            </View>
          </View>
          
          <View style={styles.echoList}>
            {filteredEchos.map((echo) => (
              <EchoCard 
                key={echo.id} 
                echo={echo} 
                onHashtagPress={handleHashtagPress}
              />
            ))}
            {filteredEchos.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Plus size={32} color="#4A5568" />
                </View>
                <Text style={styles.emptyStateText}>
                  {selectedHashtag 
                    ? 'No stories found with this hashtag' 
                    : searchQuery
                      ? 'No stories match your search'
                      : 'No stories found'
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {selectedHashtag 
                    ? 'Be the first to share a story with this hashtag!'
                    : searchQuery
                      ? 'Try a different search term or explore trending topics'
                      : 'Stories from users will appear here as they post'
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  clearSearch: {
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: '500',
  },
  filterButton: {
    padding: 4,
  },
  searchModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  searchModeText: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '500',
  },
  searchResults: {
    marginTop: 12,
    paddingVertical: 8,
  },
  hashtagResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  hashtagResultActive: {
    backgroundColor: '#00FFFF',
  },
  hashtagResultText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  hashtagResultTextActive: {
    color: '#1A202C',
  },
  hashtagCount: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  hashtagCountActive: {
    backgroundColor: 'rgba(26, 32, 44, 0.3)',
  },
  hashtagCountText: {
    fontSize: 11,
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  hashtagCountTextActive: {
    color: '#1A202C',
  },
  noResults: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 16,
  },
  recentSearches: {
    marginTop: 12,
  },
  recentTitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  recentText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  echoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  echoCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFFF',
  },
  locationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationTagActive: {
    backgroundColor: '#00FFFF',
  },
  locationTagText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  locationTagTextActive: {
    color: '#1A202C',
  },
  echoSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  echoList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4A5568',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
});