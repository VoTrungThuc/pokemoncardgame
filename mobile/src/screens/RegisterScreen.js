import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng điền các trường bắt buộc (Username, Email, Mật khẩu).');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (phone.trim()) {
      const phoneDigits = phone.replace(/[^0-9]/g, '');
      if (phoneDigits !== phone || phone.length < 9 || phone.length > 11) {
        setError('Số điện thoại không hợp lệ. Vui lòng chỉ nhập từ 9 đến 11 chữ số.');
        return;
      }
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.register({
        username,
        email,
        password,
        phone,
        shippingAddress,
      });
      
      setSuccess('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (err) {
      console.log('Registration error:', err.message || err);
      let errMsg = err.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc Email đã tồn tại.';
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        const validationErrors = Object.values(err.response.data.data);
        if (validationErrors.length > 0) {
          errMsg = validationErrors[0];
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.glassCard}>
          <Text style={styles.formTitle}>Tạo Tài Khoản Trainer</Text>
          <Text style={styles.formSubtitle}>Gia nhập liên minh sưu tầm PokeCard lớn nhất</Text>
          
          {error ? (
            <LinearGradient colors={['#fef2f2', '#fee2e2']} style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#991b1b" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </LinearGradient>
          ) : null}

          {success ? (
            <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#065f46" style={{ marginRight: 6 }} />
              <Text style={styles.successText}>{success}</Text>
            </LinearGradient>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại liên lạc"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ''))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ giao hàng</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Địa chỉ giao nhận thẻ bài mặc định"
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={2}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <TouchableOpacity disabled={loading} onPress={handleRegister} style={styles.buttonWrapper}>
            <LinearGradient 
              colors={loading ? ['#64748b', '#475569'] : ['#f43f5e', '#e11d48']}
              style={styles.registerButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>HOÀN TẤT ĐĂNG KÝ</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã gia nhập League? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 24,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '750',
    textAlign: 'center',
    flexShrink: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  successText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '750',
    textAlign: 'center',
    flexShrink: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonWrapper: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  registerButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  loginLink: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: '800',
  },
});
