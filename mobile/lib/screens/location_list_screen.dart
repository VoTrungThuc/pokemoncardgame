import 'package:flutter/material.dart';
import '../services/api_service.dart';

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
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: Colors.grey.shade100),
                      ),
                      child: ListTile(
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
                      ),
                    );
                  },
                ),
    );
  }
}
