import 'package:flutter/material.dart';
import 'package:mobile/core/constants/app_colors.dart';

enum NotificationType {
  success,
  error,
  warning,
  info,
}

/// Renders a highly premium animated dialog popup for notifications (Success, Error, Warning, Info)
/// with optional confirmation and cancellation buttons. Fully backward compatible with `isSuccess`.
void showNotificationPopup({
  required BuildContext context,
  required String title,
  required String message,
  NotificationType? type,
  bool? isSuccess,
  String confirmLabel = 'ĐỒNG Ý (OK)',
  VoidCallback? onConfirm,
  String? cancelLabel,
  VoidCallback? onCancel,
}) {
  final NotificationType resolvedType = type ?? 
      (isSuccess == false ? NotificationType.error : NotificationType.success);

  Color primaryColor;
  Color lightColor;
  Color lighterColor;
  IconData iconData;

  switch (resolvedType) {
    case NotificationType.success:
      primaryColor = const Color(0xFF10B981);
      lightColor = const Color(0xFF6EE7B7);
      lighterColor = const Color(0xFFECFDF5);
      iconData = Icons.check_circle_rounded;
      break;
    case NotificationType.error:
      primaryColor = const Color(0xFFEF4444);
      lightColor = const Color(0xFFFCA5A5);
      lighterColor = const Color(0xFFFEF2F2);
      iconData = Icons.error_rounded;
      break;
    case NotificationType.warning:
      primaryColor = const Color(0xFFF59E0B);
      lightColor = const Color(0xFFFCD34D);
      lighterColor = const Color(0xFFFFFBEB);
      iconData = Icons.warning_rounded;
      break;
    case NotificationType.info:
      primaryColor = const Color(0xFF3B82F6);
      lightColor = const Color(0xFF93C5FD);
      lighterColor = const Color(0xFFEFF6FF);
      iconData = Icons.info_rounded;
      break;
  }

  showGeneralDialog(
    context: context,
    barrierDismissible: cancelLabel != null, // Force user decision if confirm-only
    barrierLabel: 'Notification',
    barrierColor: Colors.black.withOpacity(0.65),
    transitionDuration: const Duration(milliseconds: 300),
    pageBuilder: (dialogContext, animation, secondaryAnimation) {
      return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Icon header with outer glow
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 85,
                      height: 85,
                      decoration: BoxDecoration(
                        color: lighterColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: primaryColor.withOpacity(0.12),
                            blurRadius: 16,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 65,
                      height: 65,
                      decoration: BoxDecoration(
                        color: lighterColor,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: lightColor,
                          width: 2,
                        ),
                      ),
                    ),
                    Icon(
                      iconData,
                      color: primaryColor,
                      size: 38,
                    ),
                  ],
                ),
                const SizedBox(height: 22),
                // Title
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1F2937),
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(height: 10),
                // Message description
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF4B5563),
                    fontWeight: FontWeight.w600,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),
                // Buttons Column/Row
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Confirm Button
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [primaryColor, primaryColor.withRed(primaryColor.red > 200 ? primaryColor.red - 20 : primaryColor.red + 20)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: primaryColor.withOpacity(0.25),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(dialogContext); // Pop only the dialog
                          if (onConfirm != null) {
                            onConfirm();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          confirmLabel.toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ),
                    // Cancel Button if provided
                    if (cancelLabel != null) ...[
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () {
                          Navigator.pop(dialogContext); // Pop only the dialog
                          if (onCancel != null) {
                            onCancel();
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF6B7280),
                          side: const BorderSide(color: Color(0xFFE5E7EB), width: 1.5),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          cancelLabel.toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    },
    transitionBuilder: (context, animation, secondaryAnimation, child) {
      final curve = CurvedAnimation(parent: animation, curve: Curves.easeOutBack);
      return ScaleTransition(
        scale: curve,
        child: FadeTransition(
          opacity: animation,
          child: child,
        ),
      );
    },
  );
}

/// Displays a high-end, floating SnackBar toast with matching custom icons.
/// Fully backward compatible with `isSuccess`.
void showStyledSnackBar({
  required BuildContext context,
  required String message,
  NotificationType? type,
  bool? isSuccess,
  Duration duration = const Duration(seconds: 3),
}) {
  final NotificationType resolvedType = type ?? 
      (isSuccess == false ? NotificationType.error : NotificationType.success);

  Color primaryColor;
  IconData iconData;

  switch (resolvedType) {
    case NotificationType.success:
      primaryColor = const Color(0xFF10B981);
      iconData = Icons.check_circle_rounded;
      break;
    case NotificationType.error:
      primaryColor = const Color(0xFFEF4444);
      iconData = Icons.error_rounded;
      break;
    case NotificationType.warning:
      primaryColor = const Color(0xFFF59E0B);
      iconData = Icons.warning_rounded;
      break;
    case NotificationType.info:
      primaryColor = const Color(0xFF3B82F6);
      iconData = Icons.info_rounded;
      break;
  }

  ScaffoldMessenger.of(context).clearSnackBars();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: primaryColor,
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      duration: duration,
      content: Row(
        children: [
          Icon(
            iconData,
            color: Colors.white,
            size: 22,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
