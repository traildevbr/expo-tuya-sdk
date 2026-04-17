import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
} from 'react-native';
import HomeManagementModule from 'expo-tuya-sdk/src/HomeManagementModule';

export default function HomeInvitationExample() {
    const [homeId, setHomeId] = useState('');
    const [invitationCode, setInvitationCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Gerar código de convite
    const handleGenerateInvitation = async () => {
        if (!homeId.trim()) {
            Alert.alert('Erro', 'Por favor, insira o ID da casa');
            return;
        }

        setLoading(true);
        try {
            const code = await HomeManagementModule.getInvitationCode(Number(homeId));
            setGeneratedCode(code);
            Alert.alert('Sucesso!', 'Código de convite gerado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao gerar convite:', error);
            Alert.alert('Erro', error.message || 'Não foi possível gerar o código de convite');
        } finally {
            setLoading(false);
        }
    };

    // Compartilhar código de convite
    const handleShareInvitation = async () => {
        if (!generatedCode) {
            Alert.alert('Erro', 'Nenhum código de convite para compartilhar');
            return;
        }

        try {
            await Share.share({
                message: `Você foi convidado para uma casa inteligente! Use este código para aceitar: ${generatedCode}`,
                title: 'Convite para Casa Inteligente',
            });
        } catch (error: any) {
            console.error('Erro ao compartilhar:', error);
        }
    };

    // Aceitar convite
    const handleAcceptInvitation = async () => {
        if (!invitationCode.trim()) {
            Alert.alert('Erro', 'Por favor, insira o código de convite');
            return;
        }

        setLoading(true);
        try {
            await HomeManagementModule.joinHomeWithInvitationCode(invitationCode.trim());
            Alert.alert(
                'Sucesso!',
                'Você aceitou o convite e agora faz parte da casa.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setInvitationCode('');
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Erro ao aceitar convite:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível aceitar o convite. Verifique o código e tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Seção: Gerar Convite */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏠 Gerar Código de Convite</Text>
                <Text style={styles.description}>
                    Como proprietário ou administrador, você pode gerar um código de convite para adicionar
                    novos membros à sua casa.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="ID da Casa"
                    value={homeId}
                    onChangeText={setHomeId}
                    keyboardType="numeric"
                    editable={!loading}
                />

                <Button
                    title={loading ? 'Gerando...' : 'Gerar Código de Convite'}
                    onPress={handleGenerateInvitation}
                    disabled={loading || !homeId.trim()}
                />

                {generatedCode ? (
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Código gerado:</Text>
                        <Text style={styles.code}>{generatedCode}</Text>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShareInvitation}>
                            <Text style={styles.shareButtonText}>📤 Compartilhar Código</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>

            {/* Divisor */}
            <View style={styles.divider} />

            {/* Seção: Aceitar Convite */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ Aceitar Convite</Text>
                <Text style={styles.description}>
                    Recebeu um código de convite? Insira-o abaixo para entrar na casa compartilhada.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Código de convite"
                    value={invitationCode}
                    onChangeText={setInvitationCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                <Button
                    title={loading ? 'Processando...' : 'Aceitar Convite'}
                    onPress={handleAcceptInvitation}
                    disabled={loading || !invitationCode.trim()}
                />
            </View>

            {/* Informações adicionais */}
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>ℹ️ Informações</Text>
                <Text style={styles.infoText}>
                    • O código de convite permite que outras pessoas entrem na sua casa{'\n'}
                    • Você pode cancelar convites usando cancelInvitation(){'\n'}
                    • Use processInvitation() para aceitar/recusar convites pendentes{'\n'}
                    • Consulte getInvitationList() para ver todos os convites
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    codeContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0ea5e9',
    },
    codeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    code: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0ea5e9',
        marginBottom: 10,
    },
    shareButton: {
        backgroundColor: '#0ea5e9',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 10,
        backgroundColor: '#e5e5e5',
    },
    infoBox: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
});
