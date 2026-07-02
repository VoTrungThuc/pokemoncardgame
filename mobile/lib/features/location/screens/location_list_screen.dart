import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/core/services/api_service.dart';
import 'dart:math';
import 'dart:ui' show ImageFilter;
import 'package:mobile/shared/widgets/notification_popup.dart';

class LocationListScreen extends StatefulWidget {
  const LocationListScreen({super.key});

  @override
  State<LocationListScreen> createState() => _LocationListScreenState();
}

class _LocationListScreenState extends State<LocationListScreen> {
  final MapController _mapController = MapController();
  List<Map<String, dynamic>> _locations = [];
  bool _isLoading = true;

  // Mock user location near center of HCMC for calculating nearest store
  final LatLng _userLocation = const LatLng(10.7500, 106.6800);

  // States for floating control panel
  bool _isMuted = false;
  bool _bluetoothEnabled = false;

  // Fallback locations in case API is empty or offline
  final List<Map<String, dynamic>> _fallbackLocations = [
    {
      'name': 'PokeCard Store - Quận 7',
      'address': '123 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM',
      'phone': '0909 123 456',
      'workingHours': '9:00 - 21:00',
      'latitude': 10.7294,
      'longitude': 106.6958,
    },
    {
      'name': 'PokeCard Store - Quận 1',
      'address': '45 Bùi Thị Xuân, Bến Thành, Quận 1, TP.HCM',
      'phone': '0909 654 321',
      'workingHours': '9:00 - 22:00',
      'latitude': 10.7735,
      'longitude': 106.7001,
    },
    {
      'name': 'PokeCard Store - Bình Thạnh',
      'address': '205 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM',
      'phone': '0909 789 012',
      'workingHours': '9:00 - 21:30',
      'latitude': 10.8016,
      'longitude': 106.7088,
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchLocations();
  }

  Future<void> _fetchLocations() async {
    try {
      final list = await ApiService.getLocations();
      setState(() {
        _locations = list.isNotEmpty ? list : _fallbackLocations;
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching locations, using fallback: $e');
      setState(() {
        _locations = _fallbackLocations;
        _isLoading = false;
      });
    }
  }

  // Haversine formula to calculate distance between coordinates
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295;
    var c = cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
    return 12742 * asin(sqrt(a)); // 2 * R; R = 6371 km
  }

  Future<void> _openMapDirections(double lat, double lng) async {
    final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(url, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      if (mounted) {
        showStyledSnackBar(
          context: context,
          message: 'Không thể mở bản đồ: $e',
          type: NotificationType.error,
        );
      }
    }
  }

  Future<void> _makeCall(String phoneNumber) async {
    final url = Uri.parse('tel:${phoneNumber.replaceAll(' ', '')}');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    } catch (e) {
      if (mounted) {
        showStyledSnackBar(
          context: context,
          message: 'Không thể gọi điện: $e',
          type: NotificationType.error,
        );
      }
    }
  }

  void _showStoreDetails(Map<String, dynamic> loc) {
    // Distance from mock user
    final storeLat = double.tryParse(loc['latitude']?.toString() ?? '') ?? 0.0;
    final storeLng = double.tryParse(loc['longitude']?.toString() ?? '') ?? 0.0;
    final distance = _calculateDistance(_userLocation.latitude, _userLocation.longitude, storeLat, storeLng);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 20,
                spreadRadius: 5,
              )
            ]
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 50,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              
              // Header Card Info
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.purple.shade50,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(Icons.storefront_rounded, color: Colors.purple.shade800, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          loc['name'] ?? 'PokeCard Store Branch',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Đang hoạt động',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.green.shade800,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '•  Cách bạn ${distance.toStringAsFixed(1)} km',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Information Rows with background cards
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.location_on_rounded, color: Colors.purple.shade800, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            loc['address'] ?? 'Không có địa chỉ',
                            style: const TextStyle(
                              fontSize: 14, 
                              color: Colors.black87,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(Icons.phone_in_talk_rounded, color: Colors.purple.shade800, size: 20),
                        const SizedBox(width: 12),
                        Text(
                          loc['phone'] ?? 'Không có số điện thoại',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(Icons.access_time_filled_rounded, color: Colors.purple.shade800, size: 20),
                        const SizedBox(width: 12),
                        Text(
                          'Mở cửa hàng ngày: ${loc['workingHours'] ?? "9:00 - 21:00"}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              
              // Gradient Call & Directions buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        side: BorderSide(color: Colors.purple.shade800, width: 1.5),
                        backgroundColor: Colors.white,
                      ),
                      icon: Icon(Icons.call_rounded, color: Colors.purple.shade800, size: 22),
                      label: Text(
                        'Gọi điện',
                        style: TextStyle(
                          color: Colors.purple.shade800, 
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      onPressed: () {
                        final phone = loc['phone']?.toString();
                        if (phone != null) {
                          _makeCall(phone);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.purple.shade800, Colors.indigo.shade700],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.purple.shade200.withOpacity(0.5),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ]
                      ),
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.near_me_rounded, color: Colors.white, size: 22),
                        label: const Text(
                          'Đường đi',
                          style: TextStyle(
                            color: Colors.white, 
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        onPressed: () {
                          if (storeLat != 0.0 && storeLng != 0.0) {
                            _openMapDirections(storeLat, storeLng);
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  void _showStoreListBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.7,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 50,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              const Text(
                'Danh sách chi nhánh',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.builder(
                  itemCount: _locations.length,
                  itemBuilder: (context, index) {
                    final loc = _locations[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade100),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.purple.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.storefront_rounded, color: Colors.purple.shade800),
                        ),
                        title: Text(
                          loc['name'] ?? 'Cửa hàng',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        subtitle: Text(
                          loc['address'] ?? '',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                        ),
                        trailing: Icon(Icons.chevron_right_rounded, color: Colors.purple.shade800),
                        onTap: () {
                          Navigator.pop(context);
                          final lat = double.tryParse(loc['latitude']?.toString() ?? '') ?? 0.0;
                          final lng = double.tryParse(loc['longitude']?.toString() ?? '') ?? 0.0;
                          final target = LatLng(lat, lng);
                          _mapController.move(target, 15.5);
                          _showStoreDetails(loc);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.deepPurple))
          : Stack(
              children: [
                // 1. MAIN INTERACTIVE MAP LAYER (With premium Positron Mapbox-like styling)
                FlutterMap(
                  mapController: _mapController,
                  options: const MapOptions(
                    initialCenter: LatLng(10.7735, 106.7001), // Default focus on Quận 1 store
                    initialZoom: 13.5,
                    maxZoom: 18.0,
                    minZoom: 10.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                      subdomains: const ['a', 'b', 'c', 'd'],
                      userAgentPackageName: 'com.example.mobile',
                    ),
                    MarkerLayer(
                      markers: _locations.map((loc) {
                        final lat = double.tryParse(loc['latitude']?.toString() ?? '') ?? 0.0;
                        final lng = double.tryParse(loc['longitude']?.toString() ?? '') ?? 0.0;
                        final position = LatLng(lat, lng);
                        return Marker(
                          point: position,
                          width: 65,
                          height: 65,
                          child: GestureDetector(
                            onTap: () {
                              _showStoreDetails(loc);
                              _mapController.move(position, 15.5);
                            },
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // Pin pointer tail (styled location drop-pin)
                                Positioned(
                                  bottom: 0,
                                  child: Icon(
                                    Icons.location_on_rounded,
                                    color: Colors.purple.shade800,
                                    size: 62,
                                    shadows: [
                                      BoxShadow(
                                        color: Colors.purple.shade900.withOpacity(0.35),
                                        blurRadius: 8,
                                        spreadRadius: 1,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                ),
                                // Custom vector PokeBall inside the pin head
                                Positioned(
                                  top: 3,
                                  child: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                      boxShadow: const [
                                        BoxShadow(
                                          color: Colors.black26,
                                          blurRadius: 2,
                                          offset: Offset(0, 1),
                                        ),
                                      ],
                                    ),
                                    child: ClipOval(
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          Column(
                                            children: [
                                              Expanded(child: Container(color: Colors.red.shade600)),
                                              Container(height: 2, color: Colors.black),
                                              Expanded(child: Container(color: Colors.white)),
                                            ],
                                          ),
                                          Container(
                                            width: 10,
                                            height: 10,
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              shape: BoxShape.circle,
                                              border: Border.all(color: Colors.black, width: 1.5),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),

                // 2. BACK BUTTON (TOP LEFT)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 12,
                  left: 16,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 12,
                          spreadRadius: 1,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.chevron_left_rounded, color: Colors.black87, size: 28),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ),

                // 3. PILL ACTION BUTTON (TOP CENTER)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 12,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: GestureDetector(
                      onTap: () {
                        if (_locations.isEmpty) return;
                        // Find the closest store relative to mock user location
                        Map<String, dynamic>? nearestStore;
                        double minDistance = double.infinity;
                        for (final loc in _locations) {
                          final lat = double.tryParse(loc['latitude']?.toString() ?? '') ?? 0.0;
                          final lng = double.tryParse(loc['longitude']?.toString() ?? '') ?? 0.0;
                          final dist = _calculateDistance(
                            _userLocation.latitude,
                            _userLocation.longitude,
                            lat,
                            lng,
                          );
                          if (dist < minDistance) {
                            minDistance = dist;
                            nearestStore = loc;
                          }
                        }
                        if (nearestStore != null) {
                          final lat = double.tryParse(nearestStore['latitude']?.toString() ?? '') ?? 0.0;
                          final lng = double.tryParse(nearestStore['longitude']?.toString() ?? '') ?? 0.0;
                          final target = LatLng(lat, lng);
                          _mapController.move(target, 15.5);
                          _showStoreDetails(nearestStore);
                          showStyledSnackBar(
                            context: context,
                            message: 'Cửa hàng gần nhất: ${nearestStore['name']} (${minDistance.toStringAsFixed(1)} km)',
                            type: NotificationType.info,
                            duration: const Duration(seconds: 2),
                          );
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.95),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 12,
                              spreadRadius: 1,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.near_me_rounded, color: Colors.purple.shade700, size: 18),
                            const SizedBox(width: 8),
                            const Text(
                              'CỬA HÀNG GẦN NHẤT',
                              style: TextStyle(
                                color: Colors.black87,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // 4. FLOATING CONTROL PANEL WITH GLASSMORPHISM (LOWER MIDDLE)
                Positioned(
                  bottom: 110,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(35),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(35),
                            border: Border.all(color: Colors.white12, width: 1.5),
                            boxShadow: const [
                              BoxShadow(
                                color: Colors.black26,
                                blurRadius: 10,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: Icon(
                                  _bluetoothEnabled ? Icons.bluetooth_rounded : Icons.bluetooth_disabled_rounded,
                                  color: _bluetoothEnabled ? Colors.purpleAccent.shade100 : Colors.white60,
                                  size: 26,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _bluetoothEnabled = !_bluetoothEnabled;
                                  });
                                  showStyledSnackBar(
                                    context: context,
                                    message: _bluetoothEnabled
                                        ? 'Đã bật Bluetooth kết nối thông báo cửa hàng gần'
                                        : 'Đã tắt Bluetooth kết nối thông báo cửa hàng',
                                    type: _bluetoothEnabled ? NotificationType.success : NotificationType.warning,
                                    duration: const Duration(seconds: 2),
                                  );
                                },
                              ),
                              const SizedBox(width: 16),
                              IconButton(
                                icon: Icon(
                                  _isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                                  color: _isMuted ? Colors.white60 : Colors.purpleAccent.shade100,
                                  size: 26,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isMuted = !_isMuted;
                                  });
                                  showStyledSnackBar(
                                    context: context,
                                    message: _isMuted
                                        ? 'Đã tắt âm báo hướng dẫn chỉ đường'
                                        : 'Đã bật âm báo hướng dẫn chỉ đường',
                                    type: _isMuted ? NotificationType.warning : NotificationType.success,
                                    duration: const Duration(seconds: 2),
                                  );
                                },
                              ),
                              const SizedBox(width: 16),
                              Theme(
                                data: Theme.of(context).copyWith(
                                  cardColor: Colors.grey.shade900,
                                ),
                                child: PopupMenuButton<String>(
                                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 26),
                                  onSelected: (value) {
                                    if (value == 'list') {
                                      _showStoreListBottomSheet();
                                    } else if (value == 'support') {
                                      showStyledSnackBar(
                                        context: context,
                                        message: 'Hotline hỗ trợ PokeCard Store: 1900 6868',
                                        type: NotificationType.info,
                                      );
                                    }
                                  },
                                  itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                                    const PopupMenuItem<String>(
                                      value: 'list',
                                      child: Text(
                                        'Danh sách chi nhánh',
                                        style: TextStyle(color: Colors.white, fontSize: 13),
                                      ),
                                    ),
                                    const PopupMenuItem<String>(
                                      value: 'support',
                                      child: Text(
                                        'Hỗ trợ khách hàng',
                                        style: TextStyle(color: Colors.white, fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // 5. LOCATE ME / RESET VIEW BUTTON (BOTTOM RIGHT)
                Positioned(
                  bottom: 30,
                  right: 16,
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 12,
                          spreadRadius: 1,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: FloatingActionButton(
                      heroTag: 'reset_location',
                      mini: true,
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.purple.shade800,
                      elevation: 0,
                      shape: const CircleBorder(),
                      child: const Icon(Icons.gps_fixed_rounded, size: 22),
                      onPressed: () {
                        // Move map back to central District 1 store branch
                        _mapController.move(const LatLng(10.7735, 106.7001), 13.5);
                        showStyledSnackBar(
                          context: context,
                          message: 'Đã định vị lại bản đồ về trung tâm',
                          type: NotificationType.info,
                          duration: const Duration(seconds: 1),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
