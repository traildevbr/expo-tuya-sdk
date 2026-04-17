import { useEffect, useState, useCallback } from 'react';
import ExpoTuyaSdk, { UserAccount, HomeManagement, DevicePairing } from 'expo-tuya-sdk';
import type { HomeBean, DeviceBean } from 'expo-tuya-sdk';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';

type Screen = 'init' | 'auth' | 'home';
type AuthTab = 'login' | 'register';
export default function App() {
  const [screen, setScreen] = useState<Screen>('init');
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ExpoTuyaSdk.initialize();
        setScreen('auth');
      } catch (e: any) {
        setInitError(e.message ?? 'Failed to initialize SDK');
      }
    })();
  }, []);

  if (screen === 'init') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          {initError ? (
            <Text style={styles.error}>{initError}</Text>
          ) : (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.initText}>Initializing Tuya SDK...</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'home') {
    return <HomeScreen onLogout={() => setScreen('auth')} />;
  }

  return <AuthScreen onLoginSuccess={() => setScreen('home')} />;
}

// ─── Auth Screen ────────────────────────────────────────────────────────────

function AuthScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [tab, setTab] = useState<AuthTab>('login');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Expo Tuya SDK</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, tab === 'login' && styles.tabActive]} onPress={() => setTab('login')}>
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'register' && styles.tabActive]} onPress={() => setTab('register')}>
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>
        {tab === 'login' ? <LoginForm onSuccess={onLoginSuccess} /> : <RegisterForm onSuccess={() => setTab('login')} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [countryCode, setCountryCode] = useState('55');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill in all fields');
    setLoading(true);
    try {
      await UserAccount.loginWithEmail(countryCode, email, password);
      onSuccess();
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Login with email</Text>
      <Text style={styles.label}>Country code</Text>
      <TextInput style={styles.input} value={countryCode} onChangeText={setCountryCode} keyboardType="number-pad" placeholder="55" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" autoCapitalize="none" />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [countryCode, setCountryCode] = useState('55');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('AY');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email');
    setLoading(true);
    try {
      await UserAccount.sendVerifyCode(email, region, countryCode, 1);
      setCodeSent(true);
      Alert.alert('Code sent', 'Check your email for the verification code');
    } catch (e: any) {
      Alert.alert('Failed to send code', e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !code) return Alert.alert('Error', 'Fill in all fields');
    setLoading(true);
    try {
      await UserAccount.registerWithEmail(countryCode, email, password, code);
      Alert.alert('Success', 'Account created! You can now login.', [{ text: 'OK', onPress: onSuccess }]);
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Register with email</Text>
      <Text style={styles.label}>Country code</Text>
      <TextInput style={styles.input} value={countryCode} onChangeText={setCountryCode} keyboardType="number-pad" placeholder="55" />
      <Text style={styles.label}>Region</Text>
      <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="AY" autoCapitalize="characters" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" autoCapitalize="none" />
      {!codeSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send verification code</Text>}
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.label}>Verification code</Text>
          <TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a password" />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => { setCodeSent(false); setCode(''); }}>
            <Text style={styles.linkText}>Resend code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ─── Home Screen (after login) ──────────────────────────────────────────────

function HomeScreen({ onLogout }: { onLogout: () => void }) {
  const [homes, setHomes] = useState<HomeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAcceptInvite, setShowAcceptInvite] = useState(false);
  const [showPairing, setShowPairing] = useState(false);
  const [selectedHome, setSelectedHome] = useState<HomeBean | null>(null);

  const loadHomes = useCallback(async () => {
    setLoading(true);
    try {
      const list = await HomeManagement.queryHomeList();
      setHomes(list);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load homes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomes();
  }, [loadHomes]);

  const handleLogout = async () => {
    try {
      await UserAccount.logout();
      onLogout();
    } catch (e: any) {
      Alert.alert('Logout failed', e.message ?? 'Unknown error');
    }
  };

  const handleDismissHome = (home: HomeBean) => {
    Alert.alert('Delete Home', `Are you sure you want to delete "${home.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await HomeManagement.dismissHome(home.homeId);
            loadHomes();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete home');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerSmall}>My Homes</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : homes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No homes yet</Text>
          <Text style={styles.emptySubtext}>Create a new home or accept an invitation</Text>
        </View>
      ) : (
        <FlatList
          data={homes}
          keyExtractor={(item) => String(item.homeId)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.homeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.homeName}>{item.name}</Text>
                <Text style={styles.homeGeo}>{item.geoName || 'No location'}</Text>
                <Text style={styles.homeId}>ID: {item.homeId}</Text>
              </View>
              <View style={styles.homeActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    setSelectedHome(item);
                    setShowInvite(true);
                  }}
                >
                  <Text style={styles.iconButtonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={() => handleDismissHome(item)}>
                  <Text style={[styles.iconButtonText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, styles.fabSecondary]} onPress={() => setShowAcceptInvite(true)}>
          <Text style={styles.fabText}>📨 Accept Invite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabGreen]} onPress={() => setShowPairing(true)}>
          <Text style={styles.fabText}>＋ Add Device</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
          <Text style={styles.fabText}>+ New Home</Text>
        </TouchableOpacity>
      </View>

      <CreateHomeModal visible={showCreate} onClose={() => setShowCreate(false)} onCreated={loadHomes} />
      <InviteMemberModal visible={showInvite} home={selectedHome} onClose={() => setShowInvite(false)} />
      <AcceptInviteModal visible={showAcceptInvite} onClose={() => setShowAcceptInvite(false)} onAccepted={loadHomes} />
      <DevicePairingModal visible={showPairing} homes={homes} onClose={() => setShowPairing(false)} />
    </SafeAreaView>
  );
}

// ─── Create Home Modal ──────────────────────────────────────────────────────

function CreateHomeModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [geoName, setGeoName] = useState('');
  const [rooms, setRooms] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return Alert.alert('Error', 'Enter a home name');
    setLoading(true);
    try {
      const roomList = rooms
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      await HomeManagement.createHome(name, 0, 0, geoName, roomList);
      Alert.alert('Success', 'Home created!');
      setName('');
      setGeoName('');
      setRooms('');
      onClose();
      onCreated();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.cardTitle}>Create Home</Text>

          <Text style={styles.label}>Home name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="My Home" />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={geoName} onChangeText={setGeoName} placeholder="City name (optional)" />

          <Text style={styles.label}>Rooms (comma separated)</Text>
          <TextInput style={styles.input} value={rooms} onChangeText={setRooms} placeholder="Living Room, Bedroom, Kitchen" />

          <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={onClose}>
            <Text style={styles.linkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Invite Member Modal ────────────────────────────────────────────────────

function InviteMemberModal({
  visible,
  home,
  onClose,
}: {
  visible: boolean;
  home: HomeBean | null;
  onClose: () => void;
}) {
  const [account, setAccount] = useState('');
  const [countryCode, setCountryCode] = useState('55');
  const [nickName, setNickName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleInvite = async () => {
    if (!home || !account) return Alert.alert('Error', 'Enter the member account');
    setLoading(true);
    try {
      await HomeManagement.addMember({
        homeId: home.homeId,
        nickName: nickName || account,
        account,
        countryCode,
        role: 0,
        autoAccept: true,
      });
      Alert.alert('Success', `${account} added to "${home.name}"!`);
      setAccount('');
      setNickName('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCode = async () => {
    if (!home) return;
    setLoading(true);
    try {
      const code = await HomeManagement.getInvitationCode(home.homeId);
      setInviteCode(code);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to get invitation code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.cardTitle}>Share "{home?.name}"</Text>

          <Text style={[styles.label, { marginTop: 0 }]}>Add by account</Text>

          <Text style={styles.label}>Country code</Text>
          <TextInput style={styles.input} value={countryCode} onChangeText={setCountryCode} keyboardType="number-pad" placeholder="55" />

          <Text style={styles.label}>Account (email or phone)</Text>
          <TextInput style={styles.input} value={account} onChangeText={setAccount} keyboardType="email-address" placeholder="member@example.com" autoCapitalize="none" />

          <Text style={styles.label}>Nickname (optional)</Text>
          <TextInput style={styles.input} value={nickName} onChangeText={setNickName} placeholder="Member name" />

          <TouchableOpacity style={styles.button} onPress={handleInvite} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Member</Text>}
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.label}>Or share via invitation code</Text>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleGetCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#007AFF" /> : <Text style={[styles.buttonText, { color: '#007AFF' }]}>Generate Code</Text>}
          </TouchableOpacity>

          {inviteCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
              <Text style={styles.codeHint}>Share this code with the other person</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.linkButton} onPress={() => { setInviteCode(''); onClose(); }}>
            <Text style={styles.linkText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Accept Invite Modal ────────────────────────────────────────────────────

function AcceptInviteModal({
  visible,
  onClose,
  onAccepted,
}: {
  visible: boolean;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!invitationCode.trim()) {
      return Alert.alert('Error', 'Please enter the invitation code');
    }

    setLoading(true);
    try {
      await HomeManagement.joinHomeWithInvitationCode(invitationCode.trim());
      Alert.alert(
        'Success! 🎉',
        'You have successfully joined the home!',
        [
          {
            text: 'OK',
            onPress: () => {
              setInvitationCode('');
              onClose();
              onAccepted();
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        'Failed to join',
        e.message || 'Invalid invitation code. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.cardTitle}>Accept Home Invitation</Text>

          <Text style={styles.inviteDescription}>
            Enter the invitation code you received to join a shared home.
          </Text>

          <Text style={styles.label}>Invitation Code</Text>
          <TextInput
            style={styles.input}
            value={invitationCode}
            onChangeText={setInvitationCode}
            placeholder="Paste invitation code here"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, (!invitationCode.trim() || loading) && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!invitationCode.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Accept Invitation</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setInvitationCode('');
              onClose();
            }}
          >
            <Text style={styles.linkText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ How it works</Text>
            <Text style={styles.infoText}>
              • Ask the home owner to share their invitation code{'\n'}
              • Paste the code above{'\n'}
              • You'll get access to all devices in the home
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Device Pairing Modal ───────────────────────────────────────────────────

function DevicePairingModal({
  visible,
  homes,
  onClose,
}: {
  visible: boolean;
  homes: HomeBean[];
  onClose: () => void;
}) {
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'pairing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [pairedDevice, setPairedDevice] = useState<DeviceBean | null>(null);

  const reset = () => {
    setStatus('idle');
    setStatusMsg('');
    setPairedDevice(null);
  };

  const handleClose = () => {
    if (status === 'pairing') {
      DevicePairing.stopEzPairing().catch(() => { });
    }
    reset();
    onClose();
  };

  const handleStartPairing = async () => {
    if (!selectedHomeId) return Alert.alert('Error', 'Select a home first');
    if (!ssid.trim()) return Alert.alert('Error', 'Enter the Wi-Fi name (SSID)');

    setStatus('pairing');
    setStatusMsg('Getting pairing token...');

    // Subscribe to events
    const foundSub = DevicePairing.addListener('onDeviceFound', ({ devId }) => {
      setStatusMsg(`Device found: ${devId}`);
    });
    const bindSub = DevicePairing.addListener('onDeviceBind', ({ devId }) => {
      setStatusMsg(`Binding device: ${devId}...`);
    });
    const successSub = DevicePairing.addListener('onPairingSuccess', (device) => {
      setPairedDevice(device as DeviceBean);
      setStatus('success');
      setStatusMsg('Device paired successfully!');
      foundSub.remove();
      bindSub.remove();
      successSub.remove();
      errorSub.remove();
    });
    const errorSub = DevicePairing.addListener('onPairingError', ({ errorMsg }) => {
      setStatus('error');
      setStatusMsg(errorMsg || 'Pairing failed');
      foundSub.remove();
      bindSub.remove();
      successSub.remove();
      errorSub.remove();
    });

    try {
      const token = await DevicePairing.getPairingToken(selectedHomeId);
      setStatusMsg('Starting EZ pairing...');
      await DevicePairing.startEzPairing(ssid.trim(), password, token, 100);
    } catch (e: any) {
      if (status !== 'success') {
        setStatus('error');
        setStatusMsg(e.message || 'Pairing failed');
      }
      foundSub.remove();
      bindSub.remove();
      successSub.remove();
      errorSub.remove();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.cardTitle}>📡 Add Device (EZ Mode)</Text>

          {status === 'idle' && (
            <>
              <Text style={styles.label}>Select Home</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {homes.map((h) => (
                    <TouchableOpacity
                      key={h.homeId}
                      style={[styles.chipButton, selectedHomeId === h.homeId && styles.chipButtonActive]}
                      onPress={() => setSelectedHomeId(h.homeId)}
                    >
                      <Text style={[styles.chipText, selectedHomeId === h.homeId && styles.chipTextActive]}>
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Wi-Fi Name (SSID)</Text>
              <TextInput
                style={styles.input}
                value={ssid}
                onChangeText={setSsid}
                placeholder="Your Wi-Fi network name"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Wi-Fi Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your Wi-Fi password"
                secureTextEntry
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>ℹ️ EZ Mode</Text>
                <Text style={styles.infoText}>
                  Make sure your device is in pairing mode (usually indicated by a blinking LED).
                  Your phone must be connected to the same 2.4 GHz Wi-Fi network.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, (!selectedHomeId || !ssid.trim()) && styles.buttonDisabled]}
                onPress={handleStartPairing}
                disabled={!selectedHomeId || !ssid.trim()}
              >
                <Text style={styles.buttonText}>Start Pairing</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'pairing' && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.statusText, { marginTop: 16 }]}>{statusMsg}</Text>
              <Text style={styles.statusHint}>Keep the device in pairing mode...</Text>
              <TouchableOpacity style={[styles.button, { marginTop: 24, backgroundColor: '#FF3B30' }]} onPress={handleClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.centered}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.statusText}>Device Paired!</Text>
              {pairedDevice && (
                <View style={styles.deviceCard}>
                  <Text style={styles.deviceName}>{pairedDevice.name || 'New Device'}</Text>
                  <Text style={styles.deviceId}>ID: {pairedDevice.devId}</Text>
                  <Text style={styles.deviceId}>Product: {pairedDevice.productId}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.centered}>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.statusText}>Pairing Failed</Text>
              <Text style={styles.statusHint}>{statusMsg}</Text>
              <TouchableOpacity style={styles.button} onPress={reset}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'idle' && (
            <TouchableOpacity style={styles.linkButton} onPress={handleClose}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  scrollContent: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 28, fontWeight: '700', margin: 20, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerSmall: { fontSize: 24, fontWeight: '700' },
  logoutText: { fontSize: 15, color: '#FF3B30', fontWeight: '600' },
  initText: { marginTop: 12, fontSize: 16, color: '#666' },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 10, backgroundColor: '#e5e5ea', overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', borderRadius: 10 },
  tabText: { fontSize: 15, fontWeight: '500', color: '#666' },
  tabTextActive: { color: '#007AFF' },
  card: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#666', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF' },
  linkButton: { alignItems: 'center', marginTop: 12 },
  linkText: { color: '#007AFF', fontSize: 14 },
  error: { color: '#FF3B30', fontSize: 16, textAlign: 'center' },
  success: { color: 'green' },
  emptyText: { fontSize: 16, color: '#999' },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 8 },
  listContent: { padding: 16 },
  homeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  homeName: { fontSize: 17, fontWeight: '600' },
  homeGeo: { fontSize: 13, color: '#888', marginTop: 2 },
  homeId: { fontSize: 11, color: '#bbb', marginTop: 4 },
  homeActions: { gap: 8 },
  iconButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f0f0f5' },
  iconButtonText: { fontSize: 13, fontWeight: '600', color: '#007AFF' },
  deleteButton: { backgroundColor: '#fff0f0' },
  fabContainer: { position: 'absolute', bottom: 30, right: 20, gap: 12 },
  fab: { backgroundColor: '#007AFF', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabSecondary: { backgroundColor: '#34C759' },
  fabGreen: { backgroundColor: '#FF9500' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  codeBox: { backgroundColor: '#f0f0f5', borderRadius: 10, padding: 16, marginTop: 12, alignItems: 'center' },
  codeText: { fontSize: 20, fontWeight: '700', letterSpacing: 2, color: '#333' },
  codeHint: { fontSize: 12, color: '#999', marginTop: 4 },
  inviteDescription: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  buttonDisabled: { opacity: 0.5 },
  infoBox: { backgroundColor: '#f0f9ff', borderRadius: 10, padding: 16, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  infoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  infoText: { fontSize: 13, color: '#666', lineHeight: 20 },
  chipButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f5', borderWidth: 1, borderColor: '#ddd' },
  chipButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { fontSize: 14, color: '#333', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  statusText: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  statusHint: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 8 },
  successIcon: { fontSize: 48, textAlign: 'center' },
  errorIcon: { fontSize: 48, textAlign: 'center' },
  deviceCard: { backgroundColor: '#f0f9ff', borderRadius: 10, padding: 16, marginVertical: 16, width: '100%' },
  deviceName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  deviceId: { fontSize: 12, color: '#888' },
});
