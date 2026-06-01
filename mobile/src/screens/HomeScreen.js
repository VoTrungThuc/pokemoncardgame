import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', iconName: 'flash' },
  { id: 'card', name: 'Thẻ Bài TCG', iconName: 'copy' },
  { id: 'pack', name: 'Pack Bài', iconName: 'gift' },
  { id: 'plush', name: 'Gấu Bông', iconName: 'heart' },
  { id: 'figure', name: 'Mô Hình', iconName: 'cube' },
  { id: 'accessory', name: 'Phụ Kiện', iconName: 'shield' },
];

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [username, setUsername] = useState('Trainer');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({});
      setProducts(data || []);
      
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUsername(user.username || 'Trainer');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (search.trim() !== '') {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => {
        const type = p.cpu?.toLowerCase() || '';
        const categoryId = selectedCategory;
        if (categoryId === 'card') return type !== 'sealed' && type !== 'plush' && type !== 'figure' && type !== 'accessory';
        if (categoryId === 'pack') return type === 'sealed';
        if (categoryId === 'plush') return type === 'plush';
        if (categoryId === 'figure') return type === 'figure';
        if (categoryId === 'accessory') return type === 'accessory';
        return true;
      });
    }

    return filtered;
  };

  const renderProductItem = ({ item }) => {
    const imageUrl = api.resolveImageUrl(item.imageUrl);

    const isPromo = item.promoPrice && item.promoPrice < item.price;

    return (
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.imageBox}>
          <Image 
            source={{ uri: imageUrl || 'https://images.pokemontcg.io/swsh35/20.png' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardBrand}>{item.brand || 'Pokemon'}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          
          {item.ram && item.ram !== 'N/A' && item.ram !== 'Sealed' && item.ram !== 'Plush' && item.ram !== 'Figure' && item.ram !== 'Accessory' ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaBadge}>{item.ram}</Text>
              {item.rom && item.rom !== 'N/A' ? (
                <Text style={styles.metaBadgeRom}>{item.rom}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.priceRow}>
            {isPromo ? (
              <View>
                <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.promoPrice}>${item.promoPrice.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            )}
            
            <View style={[styles.stockStatus, item.stock > 0 ? styles.stockIn : styles.stockOut]}>
              <Text style={item.stock > 0 ? styles.stockInText : styles.stockOutText}>
                {item.stock > 0 ? `Còn ${item.stock}` : 'Hết hàng'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {}
      <LinearGradient colors={['#e53935', '#b91c1c']} style={styles.welcomeHeader}>
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeTitle}>Chào mừng trở lại,</Text>
            <Text style={styles.welcomeTrainer}>Trainer @{username} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.substring(0, 2).toUpperCase()}</Text>
          </View>
        </View>

        {}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài, gấu bông, mô hình..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            spellCheck={false}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" style={{ padding: 4 }} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons 
                name={item.iconName} 
                size={14} 
                color={selectedCategory === item.id ? '#ffffff' : '#64748b'} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === item.id && styles.selectedCategoryText
              ]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e53935" />
          <Text style={styles.loaderText}>Đang tải sản phẩm Pokemon...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredProducts()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Không tìm thấy vật phẩm nào phù hợp.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  welcomeHeader: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  welcomeTrainer: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  clearSearchIcon: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 6,
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingVertical: 14,
  },
  categoryList: {
    paddingHorizontal: 18,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedCategoryButton: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
    shadowColor: '#e53935',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  categoryIcon: {
    marginRight: 8,
    fontSize: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '850',
    color: '#64748b',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  productList: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 10,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  imageBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 4,
  },
  cardBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 2,
    minHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  metaBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  metaBadgeRom: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1e293b',
  },
  originalPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  promoPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ef4444',
  },
  stockStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockIn: {
    backgroundColor: '#f0fdf4',
  },
  stockOut: {
    backgroundColor: '#fef2f2',
  },
  stockInText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16a34a',
  },
  stockOutText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '800',
  },
});
