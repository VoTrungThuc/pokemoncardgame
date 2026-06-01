import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import CustomPopup from '../components/CustomPopup';

export default function InventoryScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCpu, setFormCpu] = useState('Fire'); 
  const [formPokemonName, setFormPokemonName] = useState('');
  const [formScore, setFormScore] = useState('5.0');
  const [formCamera, setFormCamera] = useState('330 HP'); 
  const [formBattery, setFormBattery] = useState(''); 
  const [formRam, setFormRam] = useState('Ultra Rare'); 
  const [formRom, setFormRom] = useState('Near Mint'); 
  const [formScreen, setFormScreen] = useState(''); 
  const [formOs, setFormOs] = useState(''); 
  const [formImageUrl, setFormImageUrl] = useState('');

  
  const [popupConfig, setPopupConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
  });

  const showPopup = (type, title, message, onConfirm = null, confirmText = 'Đồng ý', cancelText = 'Hủy') => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: () => {
        setPopupConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      confirmText,
      cancelText,
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({ size: 200 });
      setProducts(data || []);
    } catch (e) {
      console.error(e);
      showPopup('error', 'Lỗi', 'Không thể tải danh sách sản phẩm.');
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
    if (search.trim() === '') return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pokemonName?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormStock('');
    setFormDesc('');
    setFormCpu('Fire');
    setFormPokemonName('');
    setFormScore('5.0');
    setFormCamera('330 HP');
    setFormBattery('');
    setFormRam('Ultra Rare');
    setFormRom('Near Mint');
    setFormScreen('');
    setFormOs('');
    setFormImageUrl('');
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name || '');
    setFormPrice(product.price ? product.price.toString() : '');
    setFormStock(product.stock ? product.stock.toString() : '0');
    setFormDesc(product.description || '');
    setFormCpu(product.cpu || 'Fire');
    setFormPokemonName(product.pokemonName || '');
    setFormScore(product.score ? product.score.toString() : '5.0');
    setFormCamera(product.camera || '330 HP');
    setFormBattery(product.battery || '');
    setFormRam(product.ram || 'Ultra Rare');
    setFormRom(product.rom || 'Near Mint');
    setFormScreen(product.screen || '');
    setFormOs(product.os || '');
    setFormImageUrl(product.imageUrl || '');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice.trim() || !formStock.trim()) {
      showPopup('warning', 'Thiếu thông tin', 'Vui lòng nhập Tên, Giá bán và Số lượng tồn kho.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock);
    const scoreNum = parseFloat(formScore);

    if (isNaN(priceNum) || priceNum < 0) {
      showPopup('warning', 'Giá bán không hợp lệ', 'Giá bán phải là số dương.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      showPopup('warning', 'Số lượng không hợp lệ', 'Số lượng tồn kho phải là số nguyên dương.');
      return;
    }

    const productPayload = {
      name: formName,
      brand: 'Pokemon',
      price: priceNum,
      stock: stockNum,
      description: formDesc,
      cpu: formCpu, 
      pokemonName: formPokemonName || formName.split(' ')[0], 
      score: isNaN(scoreNum) ? 5.0 : scoreNum,
      camera: formCamera, 
      battery: formBattery, 
      ram: formRam, 
      rom: formRom, 
      screen: formScreen, 
      os: formOs, 
      imageUrl: formImageUrl || '/images/products/default.png',
      isAvailable: stockNum > 0
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        
        const updated = await api.updateProduct(editingProduct.id, productPayload);
        showPopup('success', 'Thành công', `Đã cập nhật thẻ bài "${formName}"!`);
      } else {
        
        const created = await api.createProduct(productPayload);
        showPopup('success', 'Thành công', `Đã thêm mới thẻ bài "${formName}" vào kho!`);
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      console.warn(err);
      showPopup('error', 'Lỗi lưu dữ liệu', err.response?.data?.message || 'Không thể lưu thay đổi vào cơ sở dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!editingProduct) return;
    
    showPopup(
      'confirm',
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa thẻ bài "${editingProduct.name}" khỏi kho hàng?`,
      async () => {
        try {
          setSubmitting(true);
          await api.deleteProduct(editingProduct.id);
          setModalVisible(false);
          fetchProducts();
          
          setTimeout(() => {
            showPopup('success', 'Đã xóa', 'Xóa thẻ bài thành công!');
          }, 500);
        } catch (err) {
          console.warn(err);
          showPopup('error', 'Lỗi', 'Không thể xóa thẻ bài. Vui lòng kiểm tra lại.');
        } finally {
          setSubmitting(false);
        }
      },
      'Xóa ngay',
      'Hủy'
    );
  };

  const renderItem = ({ item }) => {
    const imageUrl = api.resolveImageUrl(item.imageUrl);

    
    let stockBadgeStyle = styles.stockOk;
    let stockTextStyle = styles.stockOkText;
    let stockText = `Còn ${item.stock} thẻ`;

    if (item.stock === 0) {
      stockBadgeStyle = styles.stockOut;
      stockTextStyle = styles.stockOutText;
      stockText = 'Hết hàng';
    } else if (item.stock <= 3) {
      stockBadgeStyle = styles.stockWarn;
      stockTextStyle = styles.stockWarnText;
      stockText = `Sắp hết (${item.stock})`;
    }

    return (
      <View style={styles.itemRow}>
        <Image 
          source={{ uri: imageUrl || 'https://images.pokemontcg.io/swsh35/20.png' }} 
          style={styles.itemImage}
          resizeMode="contain"
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemBrand}>{item.ram || 'Rarity'}</Text>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.stockBadge, stockBadgeStyle]}>
              <Text style={[styles.stockBadgeText, stockTextStyle]}>{stockText}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.cpu || 'Card'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {}
      <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerSubtitle}>Quản trị viên</Text>
            <Text style={styles.headerTitle}>Quản lý Kho Hàng 📦</Text>
          </View>
        </View>

        {}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên thẻ hoặc tên Pokemon..."
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
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.centerText}>Đang tải danh sách kho...</Text>
        </View>
      ) : getFilteredProducts().length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="file-tray-outline" size={48} color="#94a3b8" />
          <Text style={styles.centerText}>Không tìm thấy thẻ nào khớp trong kho.</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredProducts()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <LinearGradient 
          colors={['#4f46e5', '#3730a3']} 
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Cập nhật Thẻ Pokémon' : 'Thêm Thẻ Pokémon Mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Tên thẻ Pokémon *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: Pikachu VMAX Secret"
                value={formName}
                onChangeText={setFormName}
                autoCorrect={false}
                spellCheck={false}
              />

              <View style={styles.formRow}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Giá bán ($) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="99.99"
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Số lượng trong kho *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="5"
                    keyboardType="numeric"
                    value={formStock}
                    onChangeText={setFormStock}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Tên Pokémon gốc</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: Pikachu, Charizard"
                value={formPokemonName}
                onChangeText={setFormPokemonName}
                autoCorrect={false}
                spellCheck={false}
              />

              <View style={styles.formRow}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Loại hệ bài (cpu)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Fire, Water, sealed..."
                    value={formCpu}
                    onChangeText={setFormCpu}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Điểm sức mạnh (score)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="5.6"
                    keyboardType="numeric"
                    value={formScore}
                    onChangeText={setFormScore}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Chỉ số HP (camera)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="330 HP"
                    value={formCamera}
                    onChangeText={setFormCamera}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Mã số thẻ (battery)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="074/073"
                    value={formBattery}
                    onChangeText={setFormBattery}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Độ hiếm (ram)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="VMAX, Rainbow Rare..."
                    value={formRam}
                    onChangeText={setFormRam}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Tình trạng thẻ (rom)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Mint, Near Mint, SP..."
                    value={formRom}
                    onChangeText={setFormRom}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Set thẻ bài (screen)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Sword & Shield - Champion's Path"
                value={formScreen}
                onChangeText={setFormScreen}
                autoCorrect={false}
                spellCheck={false}
              />

              <Text style={styles.inputLabel}>Họa sĩ vẽ tranh (os)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="5ban Graphics"
                value={formOs}
                onChangeText={setFormOs}
                autoCorrect={false}
                spellCheck={false}
              />

              <Text style={styles.inputLabel}>Đường dẫn ảnh Pokémon</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Bỏ trống dùng ảnh mặc định hoặc nhập link"
                value={formImageUrl}
                onChangeText={setFormImageUrl}
                autoCorrect={false}
                spellCheck={false}
              />

              <Text style={styles.inputLabel}>Mô tả thẻ bài</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Mô tả chi tiết về thẻ bài..."
                multiline={true}
                numberOfLines={3}
                value={formDesc}
                onChangeText={setFormDesc}
                autoCorrect={false}
                spellCheck={false}
              />

              {submitting ? (
                <ActivityIndicator size="large" color="#4f46e5" style={{ marginVertical: 16 }} />
              ) : (
                <View style={styles.formActions}>
                  {editingProduct && (
                    <TouchableOpacity 
                      style={styles.deleteFormBtn} 
                      onPress={handleDelete}
                    >
                      <Ionicons name="trash-outline" size={20} color="#e53935" style={{ marginRight: 4 }} />
                      <Text style={styles.deleteFormBtnText}>Xóa thẻ</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.submitFormBtn, editingProduct ? styles.halfSubmit : styles.fullSubmit]} 
                    onPress={handleSubmit}
                  >
                    <Ionicons name="save-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitFormBtnText}>
                      {editingProduct ? 'Lưu' : 'Thêm mới'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {}
      <CustomPopup
        visible={popupConfig.visible}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onConfirm={popupConfig.onConfirm}
        onCancel={hidePopup => setPopupConfig(prev => ({ ...prev, visible: false }))}
        confirmText={popupConfig.confirmText}
        cancelText={popupConfig.cancelText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#a5b4fc',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemBrand: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '900',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stockOk: {
    backgroundColor: '#ecfdf5',
  },
  stockOkText: {
    color: '#059669',
  },
  stockWarn: {
    backgroundColor: '#fff7ed',
  },
  stockWarnText: {
    color: '#d97706',
  },
  stockOut: {
    backgroundColor: '#fef2f2',
  },
  stockOutText: {
    color: '#dc2626',
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  editButton: {
    padding: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  centerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  halfWidth: {
    width: '48%',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  submitFormBtn: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  halfSubmit: {
    width: '58%',
  },
  fullSubmit: {
    width: '100%',
  },
  submitFormBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '900',
  },
  deleteFormBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    width: '38%',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteFormBtnText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '900',
  },
});
