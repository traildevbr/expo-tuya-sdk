import { useEffect, useState } from 'react';
import ExpoTuyaSdk, { UserAccount } from 'expo-tuya-sdk';
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Expo Tuya SDK</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'login' && styles.tabActive]}
            onPress={() => setTab('login')}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'register' && styles.tabActive]}
            onPress={() => setTab('register')}
          >
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'login' ? (
          <LoginForm onSuccess={onLoginSuccess} />
        ) : (
          <RegisterForm onSuccess={() => setTab('login')} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Login Form ─────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [countryCode, setCountryCode] = useState('55');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await UserAccount.loginWithEmail(countryCode, email, password);
      Alert.alert('Success', 'Logged in!');
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
      <TextInput
        style={styles.input}
        value={countryCode}
        onChangeText={setCountryCode}
        keyboardType="number-pad"
        placeholder="55"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Your password"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Register Form ──────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [countryCode, setCountryCode] = useState('55');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('AY');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Enter your email');
      return;
    }

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
    if (!email || !password || !code) {
      Alert.alert('Error', 'Fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await UserAccount.registerWithEmail(countryCode, email, password, code);
      Alert.alert('Success', 'Account created! You can now login.', [
        { text: 'OK', onPress: onSuccess },
      ]);
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
      <TextInput
        style={styles.input}
        value={countryCode}
        onChangeText={setCountryCode}
        keyboardType="number-pad"
        placeholder="55"
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="AY"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
        autoCapitalize="none"
      />

      {!codeSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send verification code</Text>
          )}
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.label}>Verification code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="123456"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Choose a password"
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setCodeSent(false);
              setCode('');
            }}
          >
            <Text style={styles.linkText}>Resend code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ─── Home Screen ────────────────────────────────────────────────────────────

function HomeScreen({ onLogout }: { onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await UserAccount.logout();
      onLogout();
    } catch (e: any) {
      Alert.alert('Logout failed', e.message ?? 'Unknown error');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.header}>Welcome!</Text>
        <Text style={styles.subtitle}>You are logged in.</Text>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    margin: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  initText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#e5e5ea',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: 'green',
  },
});
