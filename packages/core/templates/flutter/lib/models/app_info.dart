class AppInfo {
  final String appName;
  final String status;
  final String framework;

  const AppInfo({
    required this.appName,
    required this.status,
    required this.framework,
  });

  factory AppInfo.fromJson(Map<String, dynamic> json) {
    return AppInfo(
      appName: json['app'] ?? '__CT_PROJECT_NAME__',
      status: json['status'] ?? 'healthy',
      framework: json['framework'] ?? 'Flutter',
    );
  }
}
