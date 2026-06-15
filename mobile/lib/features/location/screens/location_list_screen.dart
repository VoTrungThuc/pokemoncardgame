import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/core/services/api_service.dart';

class LocationListScreen extends StatefulWidget {
  const LocationListScreen({super.key});

  @override
  State<LocationListScreen> createState() => _LocationListScreenState();
}

class _LocationListScreenState extends State<LocationListScreen> {
  List<Map<String, dynamic>> _locations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLocations();
  }

  Future<void> _fetchLocations() async {
    try {
      final list = await ApiService.getLocations();
      setState(() {
        _locations = list;
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching locations: $e');
      setState(() => _isLoading = false);
    }
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể mở bản đồ: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HỆ THỐNG CỬA HÀNG'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFE53935)))
          : _locations.isEmpty
              ? const Center(child: Text('Không có cửa hàng nào được cấu hình.'))
              : ListView.builder(
                  itemCount: _locations.length,
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final loc = _locations[index];
                    return Card(
                      color: Colors.white,
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(color: Colors.grey.shade100),
                      ),
                      child: InkWell(
                        onTap: () {
                          final lat = double.tryParse(loc['latitude']?.toString() ?? '');
                          final lng = double.tryParse(loc['longitude']?.toString() ?? '');
                          if (lat != null && lng != null) {
                            _openMapDirections(lat, lng);
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Tọa độ cửa hàng không hợp lệ')),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ListTile(
                              leading: const CircleAvatar(
                                backgroundColor: Color(0xFFFFF5F5),
                                child: Icon(Icons.location_on, color: Color(0xFFE53935)),
                              ),
                              title: Text(
                                loc['name'] ?? 'Store Branch',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              subtitle: Text(
                                '${loc['address'] ?? ""}\nCoords: [${loc['latitude']}, ${loc['longitude']}]',
                                style: const TextStyle(fontSize: 10, height: 1.4),
                              ),
                              isThreeLine: true,
                              trailing: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFFFF5F5),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.directions_rounded,
                                  color: Color(0xFFE53935),
                                  size: 24,
                                ),
                              ),
                            ),
                            if (loc['latitude'] != null && loc['longitude'] != null)
                              Padding(
                                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    height: 120,
                                    width: double.infinity,
                                    color: Colors.grey.shade50,
                                    child: Image.network(
                                      'https://static-maps.yandex.ru/1.x/?ll=${loc['longitude']},${loc['latitude']}&z=15&l=map&size=450,150&pt=${loc['longitude']},${loc['latitude']},pm2rdm',
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(Icons.map_outlined, color: Colors.grey, size: 28),
                                            SizedBox(height: 4),
                                            Text(
                                              'Không thể tải bản đồ trực quan',
                                              style: TextStyle(color: Colors.grey, fontSize: 10),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

