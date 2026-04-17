import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import HomeManagementModule from 'expo-tuya-sdk/src/HomeManagementModule';

export default function AcceptHomeInvitation() {
    const [invitationCode, setInvitationCode] = useState('');
    const [loading, setLoading] = useState(false);

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
                            // Aqui você pode navegar para a tela da casa ou atualizar a lista de casas
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
        <View style={styles.container}>
            <Text style={styles.title}>Aceitar Convite de Casa</Text>
            <Text style={styles.description}>
                Insira o código de convite que você recebeu para entrar na casa compartilhada.
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
});
