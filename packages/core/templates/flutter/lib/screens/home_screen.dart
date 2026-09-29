import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/app_info.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<AppInfo> _appInfoFuture;

  @override
  void initState() {
    super.initState();
    _appInfoFuture = ApiService.checkHealth();
  }

  void _refresh() {
    setState(() {
      _appInfoFuture = ApiService.checkHealth();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('__CT_PROJECT_NAME__', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(24.0),
                  border: Border.all(color: const Color(0xFF334155)),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 16,
                      offset: Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.flutter_dash, size: 64, color: Color(0xFF818CF8)),
                    const SizedBox(height: 16),
                    const Text(
                      '__CT_PROJECT_NAME__',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Scaffolded with CodersTrim\nModular Flutter Architecture',
                      style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    FutureBuilder<AppInfo>(
                      future: _appInfoFuture,
                      builder: (context, snapshot) {
                        final status = snapshot.data?.status ?? 'Connecting...';
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('Status: ', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                              Text(
                                status,
                                style: const TextStyle(
                                  color: Color(0xFF34D399),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // @CodersTrim-Inject-Components
              const Text(
                'Edit lib/screens/home_screen.dart to start building',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _refresh,
        backgroundColor: const Color(0xFF4F46E5),
        child: const Icon(Icons.refresh, color: Colors.white),
      ),
    );
  }
}
