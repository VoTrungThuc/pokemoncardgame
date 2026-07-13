import 'package:flutter/material.dart';

/// Network image that automatically retries on failure.
/// Fixes "images sometimes missing" caused by transient network errors
/// (the default Image.network has no retry and shows a broken icon forever).
class RetryNetworkImage extends StatefulWidget {
  final String url;
  final BoxFit? fit;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final int maxRetries;

  const RetryNetworkImage({
    Key? key,
    required this.url,
    this.fit,
    this.width,
    this.height,
    this.placeholder,
    this.maxRetries = 4,
  }) : super(key: key);

  @override
  State<RetryNetworkImage> createState() => _RetryNetworkImageState();
}

class _RetryNetworkImageState extends State<RetryNetworkImage> {
  late String _currentUrl;
  int _attempt = 0;

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.url;
  }

  void _retry() {
    if (_attempt >= widget.maxRetries) return;
    _attempt++;
    // change the url slightly so Image.network re-attempts the load
    setState(() {
      _currentUrl = widget.url + (widget.url.contains('?') ? '&' : '?') + 'r=$_attempt';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Image.network(
      _currentUrl,
      fit: widget.fit,
      width: widget.width,
      height: widget.height,
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded) return child;
        return AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: frame == null
              ? (widget.placeholder ?? const SizedBox.shrink())
              : child,
        );
      },
      errorBuilder: (context, error, stackTrace) {
        if (_attempt < widget.maxRetries) {
          // retry after a short delay
          Future.delayed(const Duration(milliseconds: 400), _retry);
          return widget.placeholder ?? const SizedBox.shrink();
        }
        return const Icon(Icons.image_not_supported_outlined, color: Colors.grey);
      },
    );
  }
}
