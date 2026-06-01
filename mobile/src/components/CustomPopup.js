import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CustomPopup({
  visible,
  type = 'success', 
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getThemeColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          icon: 'close-circle',
        };
      case 'warning':
        return {
          icon: 'warning',
        };
      case 'confirm':
        return {
          icon: 'help-circle',
        };
      default:
        return {
          icon: 'information-circle',
        };
    }
  };

  const theme = getThemeColor();

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {}
          <View style={styles.topBar} />

          {}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name={theme.icon} size={38} color="#ffffff" />
            </View>
          </View>

          {}
          <View style={styles.contentContainer}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          {}
          <View style={styles.buttonContainer}>
            {type === 'confirm' ? (
              <>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={onConfirm} style={{ flex: 1 }}>
                  <View style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity activeOpacity={0.7} onPress={onConfirm || onClose} style={{ width: '100%' }}>
                <View style={styles.okButton}>
                  <Text style={styles.okButtonText}>{onConfirm ? confirmText : 'Đóng'}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', 
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#fee2e2', 
    overflow: 'hidden',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    paddingBottom: 24,
  },
  topBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#e53935', 
  },
  iconWrapper: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935', 
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b', 
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  messageText: {
    fontSize: 13,
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fef2f2', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444', 
  },
  confirmButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935', 
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff', 
  },
  okButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935', 
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff', 
  },
});
