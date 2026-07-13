import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/product/providers/market_provider.dart';
import 'package:mobile/features/product/models/product.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/widgets/retry_network_image.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  String _selectedCategoryId = 'all';

  // Advanced filters state
  String _selectedElementType = 'all'; // 'all', 'Fire', 'Water', 'Grass', etc.
  String _selectedRarity = 'all'; // 'all', 'Holo Rare', etc.
  String _priceSortOrder = 'none'; // 'none', 'asc', 'desc'
  double _minPrice = 0.0;
  double _maxPrice = 500.0;

  final List<Map<String, dynamic>> _categories = [
    {'id': 'all', 'name': 'Tất Cả Vật Phẩm 🌐', 'icon': Icons.flash_on},
    {'id': 'card', 'name': 'Thẻ Bài TCG 🃏', 'icon': Icons.copy},
    {'id': 'pack', 'name': 'Gói Bài Bí Ẩn ⚡', 'icon': Icons.card_giftcard},
    {'id': 'plush', 'name': 'Thú Bông Pokémon 🧸', 'icon': Icons.toys},
    {'id': 'figure', 'name': 'Mô Hình Figure 🌟', 'icon': Icons.token},
    {'id': 'accessory', 'name': 'Phụ Kiện Trainer 🛡️', 'icon': Icons.shield},
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<MarketProvider>(context, listen: false).fetchProducts());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Product> _getFilteredProducts(List<Product> allProducts) {
    String query = _searchController.text.toLowerCase().trim();
    List<Product> list = allProducts;

    if (query.isNotEmpty) {
      list = list.where((p) =>
          p.name.toLowerCase().contains(query) ||
          p.brand.toLowerCase().contains(query)).toList();
    }

    if (_selectedCategoryId != 'all') {
      list = list.where((p) {
        final type = p.cpu?.toLowerCase() ?? '';
        if (_selectedCategoryId == 'card') {
          return type != 'sealed' && type != 'plush' && type != 'figure' && type != 'accessory';
        }
        if (_selectedCategoryId == 'pack') return type == 'sealed';
        if (_selectedCategoryId == 'plush') return type == 'plush';
        if (_selectedCategoryId == 'figure') return type == 'figure';
        if (_selectedCategoryId == 'accessory') return type == 'accessory';
        return true;
      }).toList();
    }

    // Filter by Element Type (for card products)
    if (_selectedElementType != 'all') {
      list = list.where((p) => p.isCard && p.cpu?.toLowerCase() == _selectedElementType.toLowerCase()).toList();
    }

    // Filter by Rarity (for card products)
    if (_selectedRarity != 'all') {
      list = list.where((p) => p.isCard && p.ram?.toLowerCase().contains(_selectedRarity.toLowerCase()) == true).toList();
    }

    // Filter by Price Range
    list = list.where((p) => p.activePrice >= _minPrice && p.activePrice <= _maxPrice).toList();

    // Sort by Price
    if (_priceSortOrder != 'none') {
      list = List.from(list);
      if (_priceSortOrder == 'asc') {
        list.sort((a, b) => a.activePrice.compareTo(b.activePrice));
      } else if (_priceSortOrder == 'desc') {
        list.sort((a, b) => b.activePrice.compareTo(a.activePrice));
      }
    }

    return list;
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      backgroundColor: Colors.white,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Bộ lọc Pokémon nâng cao',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Element Type Filter
                  const Text(
                    'Hệ Pokémon (Element Type)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      _buildFilterChip(
                        label: 'Tất cả',
                        isSelected: _selectedElementType == 'all',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'all');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Lửa 🔥',
                        isSelected: _selectedElementType == 'Fire',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Fire');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Nước 💧',
                        isSelected: _selectedElementType == 'Water',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Water');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Cỏ 🍃',
                        isSelected: _selectedElementType == 'Grass',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Grass');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Sấm Sét ⚡',
                        isSelected: _selectedElementType == 'Lightning',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Lightning');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Siêu Nhiên 🔮',
                        isSelected: _selectedElementType == 'Psychic',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Psychic');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Bóng Tối 🌙',
                        isSelected: _selectedElementType == 'Darkness',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Darkness');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Rồng 🐉',
                        isSelected: _selectedElementType == 'Dragon',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Dragon');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Thép ⚙️',
                        isSelected: _selectedElementType == 'Metal',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Metal');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Giác Đấu ✊',
                        isSelected: _selectedElementType == 'Fighting',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Fighting');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Hệ Vô Sắc ⚪',
                        isSelected: _selectedElementType == 'Colorless',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedElementType = 'Colorless');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Rarity Filter
                  const Text(
                    'Độ hiếm (Rarity)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      _buildFilterChip(
                        label: 'Tất cả',
                        isSelected: _selectedRarity == 'all',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'all');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Thường 📄',
                        isSelected: _selectedRarity == 'Common',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Common');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Holo Rare ✨',
                        isSelected: _selectedRarity == 'Holo Rare',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Holo Rare');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Double Rare 🃏',
                        isSelected: _selectedRarity == 'Double Rare',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Double Rare');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Ultra Rare 💎',
                        isSelected: _selectedRarity == 'Ultra Rare',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Ultra Rare');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Full Art 🎭',
                        isSelected: _selectedRarity == 'Full Art',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Full Art');
                        },
                      ),
                      _buildFilterChip(
                        label: 'VMAX ⚡',
                        isSelected: _selectedRarity == 'VMAX',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'VMAX');
                        },
                      ),
                      _buildFilterChip(
                        label: 'VSTAR ⭐',
                        isSelected: _selectedRarity == 'VSTAR',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'VSTAR');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Secret Rare 🌟',
                        isSelected: _selectedRarity == 'Secret Rare',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Secret Rare');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Special Art Rare 🎨',
                        isSelected: _selectedRarity == 'Special Art Rare',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Special Art Rare');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Gold Star 🌟',
                        isSelected: _selectedRarity == 'Gold Star',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _selectedRarity = 'Gold Star');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Price Range Filter
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Khoảng giá (Price Range)',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      Text(
                        '\$${_minPrice.toStringAsFixed(0)} - \$${_maxPrice.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFE53935),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  RangeSlider(
                    values: RangeValues(_minPrice, _maxPrice),
                    min: 0.0,
                    max: 500.0,
                    divisions: 50,
                    activeColor: const Color(0xFFE53935),
                    inactiveColor: const Color(0xFFF1F5F9),
                    labels: RangeLabels(
                      '\$${_minPrice.toStringAsFixed(0)}',
                      '\$${_maxPrice.toStringAsFixed(0)}',
                    ),
                    onChanged: (RangeValues values) {
                      setModalState(() {
                        _minPrice = values.start;
                        _maxPrice = values.end;
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  // Price Sorting
                  const Text(
                    'Sắp xếp theo Giá',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      _buildFilterChip(
                        label: 'Mặc định',
                        isSelected: _priceSortOrder == 'none',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _priceSortOrder = 'none');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Giá: Thấp đến Cao 📈',
                        isSelected: _priceSortOrder == 'asc',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _priceSortOrder = 'asc');
                        },
                      ),
                      _buildFilterChip(
                        label: 'Giá: Cao đến Thấp 📉',
                        isSelected: _priceSortOrder == 'desc',
                        onSelected: (selected) {
                          if (selected) setModalState(() => _priceSortOrder = 'desc');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setModalState(() {
                              _selectedElementType = 'all';
                              _selectedRarity = 'all';
                              _priceSortOrder = 'none';
                              _minPrice = 0.0;
                              _maxPrice = 500.0;
                            });
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFFE53935),
                            side: const BorderSide(color: Color(0xFFE53935), width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            minimumSize: const Size(double.infinity, 48),
                          ),
                          child: const Text(
                            'Đặt lại',
                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {}); // Apply changes to home screen state
                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE53935),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            minimumSize: const Size(double.infinity, 48),
                          ),
                          child: const Text(
                            'Áp dụng',
                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required Function(bool) onSelected,
  }) {
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: onSelected,
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isSelected ? Colors.white : const Color(0xFF64748B),
      ),
      selectedColor: const Color(0xFFE53935),
      backgroundColor: const Color(0xFFF1F5F9),
      checkmarkColor: Colors.white,
      side: BorderSide.none,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final market = Provider.of<MarketProvider>(context);
    final trainerName = auth.user?.username ?? 'Trainer';

    final filtered = _getFilteredProducts(market.products);
    final isFilterActive = _selectedElementType != 'all' || 
        _selectedRarity != 'all' || 
        _priceSortOrder != 'none' ||
        _minPrice != 0.0 ||
        _maxPrice != 500.0;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => market.fetchProducts(),
        color: const Color(0xFFE53935),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Welcome & Search Header
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.only(left: 24, right: 24, top: 48, bottom: 24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFE53935), Color(0xFFB91C1C)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(36),
                    bottomRight: Radius.circular(36),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Chào mừng trở lại,',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white70,
                              ),
                            ),
                            Text(
                              'Trainer @$trainerName',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: Colors.white24,
                          child: auth.user?.role == 'ADMIN'
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(22),
                                  child: Image.asset(
                                    'assets/admin_logo.png',
                                    width: 44,
                                    height: 44,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Text(
                                  trainerName.substring(0, 2).toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Search Bar & Filter Row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 52,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: TextField(
                              controller: _searchController,
                              onChanged: (_) => setState(() {}),
                              decoration: InputDecoration(
                                hintText: 'Tìm kiếm bài, gấu bông, mô hình...',
                                hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                                prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8)),
                                suffixIcon: _searchController.text.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear, color: Color(0xFF94A3B8)),
                                        onPressed: () {
                                          _searchController.clear();
                                          setState(() {});
                                        },
                                      )
                                    : null,
                                filled: false,
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        GestureDetector(
                          onTap: _showFilterBottomSheet,
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                height: 52,
                                width: 52,
                                decoration: BoxDecoration(
                                  color: Colors.white24,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.white38),
                                ),
                                child: const Icon(
                                  Icons.tune_rounded,
                                  color: Colors.white,
                                ),
                              ),
                              if (isFilterActive)
                                Positioned(
                                  top: -2,
                                  right: -2,
                                  child: Container(
                                    height: 12,
                                    width: 12,
                                    decoration: const BoxDecoration(
                                      color: Colors.yellow,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Horizontal Categories Scroll
            SliverToBoxAdapter(
              child: Container(
                height: 70,
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  itemCount: _categories.length,
                  itemBuilder: (context, idx) {
                    final cat = _categories[idx];
                    final isSelected = _selectedCategoryId == cat['id'];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 5.0),
                      child: ChoiceChip(
                        label: Row(
                          children: [
                            Icon(
                              cat['icon'] as IconData,
                              size: 14,
                              color: isSelected ? Colors.white : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 6),
                            Text(cat['name'] as String),
                          ],
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedCategoryId = cat['id'] as String);
                          }
                        },
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : const Color(0xFF64748B),
                        ),
                        selectedColor: const Color(0xFFE53935),
                        backgroundColor: Colors.white,
                        checkmarkColor: Colors.white,
                        side: BorderSide(color: Colors.grey.shade200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Product Grid
            if (market.isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFFE53935)),
                ),
              )
            else if (filtered.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.search_off_rounded, size: 48, color: Color(0xFF94A3B8)),
                      SizedBox(height: 12),
                      Text(
                        'Không tìm thấy vật phẩm nào phù hợp.',
                        style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 14.0),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.72,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, idx) {
                      final item = filtered[idx];
                      final resolvedImg = ApiService.resolveImageUrl(item.imageUrl);
                      return GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: item.id),
                        child: Card(
                          color: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(24),
                            side: BorderSide(color: Colors.grey.shade100),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Image Box
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(18),
                                    ),
                                    padding: const EdgeInsets.all(8),
                                    width: double.infinity,
                                    child: RetryNetworkImage(
                                      url: resolvedImg,
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  item.brand.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF94A3B8),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item.name,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                // Rarity & HP Meta badges if is a card
                                if (item.isCard && item.ram != null && item.ram != 'N/A')
                                  Wrap(
                                    spacing: 4,
                                    runSpacing: 4,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFEF3C7),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          item.ram!,
                                          style: const TextStyle(
                                            fontSize: 7,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFFB45309),
                                          ),
                                        ),
                                      ),
                                      if (item.camera != null && item.camera != 'N/A')
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFDBEAFE),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            item.camera!,
                                            style: const TextStyle(
                                              fontSize: 7,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF1D4ED8),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                const SizedBox(height: 10),
                                // Pricing & Stock Row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (item.isPromo) ...[
                                          Text(
                                            '\$${item.price.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              fontSize: 9,
                                              decoration: TextDecoration.lineThrough,
                                              color: Color(0xFF94A3B8),
                                            ),
                                          ),
                                          Text(
                                            '\$${item.promoPrice!.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w900,
                                              color: Color(0xFFEF4444),
                                            ),
                                          ),
                                        ] else
                                          Text(
                                            '\$${item.price.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w900,
                                              color: Color(0xFF1E293B),
                                            ),
                                          ),
                                      ],
                                    ),
                                    // Stock badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: item.stock > 0 ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        item.stock > 0 ? 'Còn ${item.stock}' : 'Hết',
                                        style: TextStyle(
                                          fontSize: 8,
                                          fontWeight: FontWeight.bold,
                                          color: item.stock > 0 ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                    childCount: filtered.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
