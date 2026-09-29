import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/app_info.dart';

class ApiService {
  static const String baseUrl = '__CT_API_BASE_URL__';

  static Future<AppInfo> checkHealth() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health')).timeout(
        const Duration(seconds: 3),
      );
      if (response.statusCode == 200) {
        return AppInfo.fromJson(jsonDecode(response.body));
      }
    } catch (_) {
      // Standalone mode / offline fallback
    }
    return const AppInfo(
      appName: '__CT_PROJECT_NAME__',
      status: 'Standalone Mobile Mode',
      framework: 'Flutter 3.x Native',
    );
  }
}
