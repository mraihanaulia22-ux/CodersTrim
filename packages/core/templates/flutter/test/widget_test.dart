import 'package:flutter_test/flutter_test.dart';
import 'package:coderstrim_app/main.dart';

void main() {
  testWidgets('CodersTrim smoke test verifies HomeScreen loads', (WidgetTester tester) async {
    await tester.pumpWidget(const CodersTrimApp());
    expect(find.text('__CT_PROJECT_NAME__'), findsWidgets);
  });
}
