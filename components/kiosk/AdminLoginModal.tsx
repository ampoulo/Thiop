import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { KioskTheme } from '@/constants/theme';
import { login } from '@/services/api';

interface AdminLoginModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

export default function AdminLoginModal({ visible, onClose, onSuccess }: AdminLoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            console.log(`[AdminLoginModal] Attempting login for: ${email}`);
            // On tente de se connecter avec les identifiants
            const response = await login(email, password);
            console.log('[AdminLoginModal] Response:', JSON.stringify(response));

            if (response && response.uid) {
                // Succès : C'est un admin valide
                console.log(`[AdminLoginModal] Login success for user: ${response.name}, Company: ${response.company_id}`);
                setEmail('');
                setPassword('');
                onSuccess(response);
            } else {
                console.warn('[AdminLoginModal] Login failed: Invalid response structure', response);
                Alert.alert('Erreur', 'Identifiants incorrects ou réponse invalide');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            Alert.alert('Erreur', 'Connexion impossible. Vérifiez votre réseau.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setPassword('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Accès Manager</Text>
                    <Text style={styles.subtitle}>Veuillez vous identifier pour accéder aux réglages</Text>

                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mot de passe"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Valider</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        marginTop: 10,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '700',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
