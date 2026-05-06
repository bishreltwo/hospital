import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// BACKEND URL - компьютерийн IP хаягаа оруулна
const API_URL = 'http://10.0.2.2:5000'; // Android emulator
// const API_URL = 'http://192.168.x.x:5000'; // Утсан дээр test хийхэд IP солино

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ==================== LOGIN SCREEN ====================
function LoginScreen({ navigation }: any) {
  const [register, setRegister] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (token) navigation.replace('Dashboard');
  };

  const handleLogin = async () => {
    if (!register || !password) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('patientId', data.patientId);
        navigation.replace('Dashboard');
      } else {
        setError(data.message || 'Нэвтрэх мэдээлэл буруу');
      }
    } catch {
      setError('Сервертэй холбогдож чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.loginBg}>
      <StatusBar barStyle="light-content" />
      <View style={s.logoBox}>
        <Text style={s.logoIcon}>🏥</Text>
        <Text style={s.logoTitle}>
          <Text style={{ color: '#00d4ff' }}>MEDI NOVA</Text> TECH
        </Text>
        <Text style={s.logoSub}>Нэгдсэн Эмнэлгийн Систем</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Нэвтрэх</Text>

        <Text style={s.label}>Регистрийн дугаар</Text>
        <TextInput style={s.input} placeholder="XX12345678" value={register}
          onChangeText={setRegister} autoCapitalize="characters" placeholderTextColor="#a0b4d0" />

        <Text style={s.label}>Нууц үг</Text>
        <TextInput style={s.input} placeholder="••••••••" value={password}
          onChangeText={setPassword} secureTextEntry placeholderTextColor="#a0b4d0" />

        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Нэвтрэх</Text>}
        </TouchableOpacity>

        <View style={s.divider}><Text style={s.dividerText}>эсвэл</Text></View>
        <TouchableOpacity style={s.btnOutline}>
          <Text style={s.btnOutlineText}>ДАН системээр нэвтрэх</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>© 2026 Medi Nova Tech</Text>
    </View>
  );
}

// ==================== DASHBOARD SCREEN ====================
function DashboardScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const token = await SecureStore.getItemAsync('token');
    const patientId = await SecureStore.getItemAsync('patientId') || '1';
    if (!token) { navigation.replace('Login'); return; }
    try {
      const res = await fetch(`${API_URL}/api/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigation.replace('Login'); return; }
      const d = await res.json();
      setData(d);
    } catch {
      Alert.alert('Алдаа', 'Сервертэй холбогдож чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('patientId');
    navigation.replace('Login');
  };

  if (loading) return (
    <View style={s.loadingBox}><ActivityIndicator size="large" color="#1a56db" /><Text style={s.loadingText}>Уншиж байна...</Text></View>
  );
  if (!data) return null;

  const unread = data.notifications?.filter((n: any) => !n.read).length || 0;
  const tabs = [
    { key: 'dashboard', label: 'Нүүр', icon: '🏠' },
    { key: 'history', label: 'Өвчин', icon: '📋' },
    { key: 'surgery', label: 'Хагалгаа', icon: '🔬' },
    { key: 'lab', label: 'Шинжилгээ', icon: '🧪' },
    { key: 'prescription', label: 'Жор', icon: '💊' },
  ];

  const filtered = activeTab === 'dashboard' ? [] : data.history?.filter((h: any) => h.type === activeTab) || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f6ff' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerLogo}><Text style={{ color: '#00d4ff' }}>MEDI</Text> NOVA</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowNotif(!showNotif)} style={s.bellBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            {unread > 0 && <View style={s.badge}><Text style={s.badgeText}>{unread}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}><Text style={s.logoutText}>Гарах</Text></TouchableOpacity>
        </View>
      </View>

      {/* Notification dropdown */}
      {showNotif && (
        <View style={s.notifDrop}>
          <Text style={s.notifTitle}>Мэдэгдэл</Text>
          {data.notifications?.map((n: any) => (
            <View key={n.id} style={[s.notifItem, !n.read && { backgroundColor: '#f0f6ff' }]}>
              <Text style={[s.notifMsg, !n.read && { fontWeight: '700' }]}>
                {!n.read && '● '}{n.message}
              </Text>
              <Text style={s.notifDate}>{n.date}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)}
            style={[s.tab, activeTab === t.key && s.tabActive]}>
            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>
              {t.icon} {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {activeTab === 'dashboard' ? (
          <>
            {/* Profile card */}
            <View style={s.profileCard}>
              <View style={s.avatar}><Text style={s.avatarText}>{data.lastName[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileName}>{data.familyName} овогтой {data.lastName} {data.firstName}</Text>
                <Text style={s.profileReg}>Регистр: {data.regNumber}</Text>
              </View>
              <View style={s.bloodBox}><Text style={s.bloodText}>{data.bloodType}</Text></View>
            </View>

            {/* Info grid */}
            <Text style={s.sectionTitle}>ҮНДСЭН МЭДЭЭЛЭЛ</Text>
            <View style={s.infoGrid}>
              {[
                { l: 'Ургийн овог', v: data.familyName },
                { l: 'Овог', v: data.lastName },
                { l: 'Нэр', v: data.firstName },
                { l: 'Төрсөн огноо', v: data.birthDate },
                { l: 'Нас', v: `${data.age} нас` },
                { l: 'Хүйс', v: data.gender === 'male' ? '👨 Эрэгтэй' : '👩 Эмэгтэй' },
                { l: 'Өндөр', v: `${data.height} см` },
                { l: 'Жин', v: `${data.weight} кг` },
                { l: 'Цусны бүлэг', v: data.bloodType },
              ].map((item, i) => (
                <View key={i} style={s.infoItem}>
                  <Text style={s.infoLabel}>{item.l}</Text>
                  <Text style={s.infoValue}>{item.v}</Text>
                </View>
              ))}
            </View>

            {/* Recent history */}
            <Text style={s.sectionTitle}>СҮҮЛИЙН ЭМНЭЛГИЙН ТҮҮХ</Text>
            {data.history?.slice(0, 3).map((item: any) => (
              <View key={item.id} style={s.historyItem}>
                <View style={s.historyIcon}><Text style={{ color: '#fff', fontSize: 16 }}>+</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.historyDiag}>{item.diagnosis}</Text>
                  <Text style={s.historyHosp}>{item.hospital}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.historyDate}>{item.date}</Text>
                  <Text style={[s.statusBadge, item.status === 'done' ? s.statusDone : s.statusOngoing]}>
                    {item.status === 'done' ? 'Хийгдсэн' : 'Хийгдэж байгаа'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {filtered.length === 0 ? (
              <View style={s.emptyBox}><Text style={s.emptyText}>Мэдээлэл байхгүй</Text></View>
            ) : (
              filtered.map((item: any) => (
                <View key={item.id} style={s.historyItem}>
                  <View style={s.historyIcon}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>
                      {tabs.find(t => t.key === activeTab)?.icon}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyDiag}>{item.diagnosis}</Text>
                    <Text style={s.historyHosp}>{item.hospital}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.historyDate}>{item.date}</Text>
                    <Text style={[s.statusBadge, item.status === 'done' ? s.statusDone : s.statusOngoing]}>
                      {item.status === 'done' ? 'Хийгдсэн' : 'Хийгдэж байгаа'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ==================== APP ====================
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== STYLES ====================
const s = StyleSheet.create({
  loginBg: { flex: 1, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 48, marginBottom: 12 },
  logoTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  logoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1a2744', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7eb8', marginBottom: 6 },
  input: { backgroundColor: '#f5f8ff', borderWidth: 1.5, borderColor: '#e3ecfc', borderRadius: 12, padding: 12, fontSize: 15, color: '#1a2744', marginBottom: 14 },
  errorBox: { backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#ffd0d0', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { fontSize: 13, color: '#c0392b' },
  btn: { backgroundColor: '#1a56db', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#93b4f0' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { alignItems: 'center', marginVertical: 16, borderTopWidth: 1, borderTopColor: '#e3ecfc', paddingTop: 16 },
  dividerText: { color: '#6b7eb8', fontSize: 13 },
  btnOutline: { borderWidth: 1.5, borderColor: '#1a56db', borderRadius: 12, padding: 12, alignItems: 'center' },
  btnOutlineText: { color: '#1a56db', fontSize: 15, fontWeight: '600' },
  footer: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 },

  header: { backgroundColor: '#1a56db', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLogo: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bellBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  logoutText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

  notifDrop: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  notifTitle: { fontWeight: '700', fontSize: 15, color: '#1a2744', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e3ecfc' },
  notifItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f6ff' },
  notifMsg: { fontSize: 14, color: '#1a2744' },
  notifDate: { fontSize: 12, color: '#6b7eb8', marginTop: 4 },

  tabBar: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 0 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e8f0fe', marginRight: 8 },
  tabActive: { backgroundColor: '#1a56db' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#1a56db' },
  tabTextActive: { color: '#fff' },

  profileCard: { backgroundColor: '#1a56db', borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  profileName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  profileReg: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  bloodBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  bloodText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#1a56db', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  infoItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e3ecfc', width: '31%' },
  infoLabel: { fontSize: 11, color: '#6b7eb8', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a2744' },

  historyItem: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e3ecfc', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  historyIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center' },
  historyDiag: { fontSize: 14, fontWeight: '600', color: '#1a2744' },
  historyHosp: { fontSize: 12, color: '#6b7eb8', marginTop: 2 },
  historyDate: { fontSize: 12, color: '#1a56db', fontWeight: '500', backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },

  statusBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4, overflow: 'hidden' },
  statusDone: { color: '#16a34a', backgroundColor: '#f0fdf4' },
  statusOngoing: { color: '#d97706', backgroundColor: '#fffbeb' },

  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: '#e3ecfc' },
  emptyText: { color: '#6b7eb8', fontSize: 15 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f6ff' },
  loadingText: { marginTop: 12, color: '#1a56db', fontSize: 16 },
});
