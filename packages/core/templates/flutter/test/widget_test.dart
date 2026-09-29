import 'package:flutter_test/flutter_test.dart';
import 'package:coderstrim_app/main.dart';

void main() {
  testWidgets('Verify HomeScreen loads and interaction works', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('Hello World!'), findsOneWidget);
    expect(find.text('__CT_PROJECT_NAME__'), findsOneWidget);
  });
}
