import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, useWindowDimensions, ScrollView, ImageBackground, TouchableWithoutFeedback, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KioskTheme } from "@/constants/theme";
import { setOrderType, clearCart } from "@/services/cartService";
import { setApiCompanyId } from "@/services/api"; // Import explicite
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CompanySelector from "@/components/kiosk/CompanySelector";
import AdminLoginModal from "@/components/kiosk/AdminLoginModal";

export default function KioskWelcome() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [isStandby, setIsStandby] = useState(true);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [pendingLoginData, setPendingLoginData] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const blinkAnim = useRef(new Animated.Value(1)).current;
    const buttonsFadeAnim = useRef(new Animated.Value(0)).current;
    const buttonsTranslateAnim = useRef(new Animated.Value(50)).current;

    // Responsive Logic
    const isSmallScreen = width < 800;
    const cardWidth = isSmallScreen ? Math.min(width - 60, 300) : 300;
    const cardHeight = isSmallScreen ? 200 : 320;
    const iconSize = isSmallScreen ? 40 : 50;
    const titleSize = isSmallScreen ? 24 : 28;
    const logoSize = isSmallScreen ? 40 : 60;
    const questionSize = isSmallScreen ? 24 : 32;
    const gap = isSmallScreen ? 20 : 40;

    useEffect(() => {
        checkCompanySelection();
        clearCart();

        // Entrance Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Blinking Text Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(blinkAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const checkCompanySelection = async () => {
        try {
            const storedCompanyId = await AsyncStorage.getItem('COMPANY_ID');
            if (storedCompanyId) {
                setCompanyId(storedCompanyId);
                setApiCompanyId(storedCompanyId); // Synchro API
            }
        } catch (error) {
            console.error("Error checking company selection", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetCompany = () => {
        // On autorise l'accès admin même en mode veille
        setShowAdminModal(true);
    };

    const onAdminSuccess = async (data: any) => {
        setShowAdminModal(false);

        // Si la borne est DÉJÀ configurée, c'est une demande de réinitialisation
        if (companyId) {
            setPendingLoginData(data);
            setShowConfirmModal(true);
        } else {
            // Si la borne n'est PAS configurée, c'est une PREMIÈRE CONFIGURATION
            await applyCompanySwitch(data);
        }
    };

    const applyCompanySwitch = async (data: any) => {
        if (data.company_id) {
            console.log(`[Index] Switching to COMPANY_ID: ${data.company_id}`);
            await AsyncStorage.setItem('COMPANY_ID', data.company_id.toString());
            await AsyncStorage.setItem('COMPANY_NAME', data.company_name || '');

            setCompanyId(data.company_id.toString());
            setApiCompanyId(data.company_id.toString()); // Update API immediately

            Alert.alert("Configuration réussie", `Borne associée à : ${data.company_name}`);
        } else {
            Alert.alert("Erreur", "Impossible de récupérer les infos du restaurant.");
        }
    };

    const handleConfirmSwitch = async () => {
        setShowConfirmModal(false);
        if (pendingLoginData) {
            await applyCompanySwitch(pendingLoginData);
            setPendingLoginData(null);
        }
    };

    const wakeUp = () => {
        if (!companyId) {
            Alert.alert("Borne non configurée", "Veuillez demander à un manager de configurer la borne (Appui long sur le logo).");
            return;
        }

        if (!isStandby) return;
        setIsStandby(false);

        // Animate buttons in
        Animated.parallel([
            Animated.timing(buttonsFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(buttonsTranslateAnim, {
                toValue: 0,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSelection = async (type: 'eat_in' | 'take_out') => {
        await setOrderType(type);
        router.push("/kiosk/menu");
    };

    if (loading) return null;

    // On affiche toujours l'interface, même si non configuré (companyId null)
    // Le blocage se fait au niveau du "wakeUp"

    return (
        <TouchableWithoutFeedback onPress={wakeUp}>
            <View style={styles.container}>
                {/* MODERN BACKGROUND */}
                <LinearGradient
                    colors={['#FF512F', '#DD2476']}
                    style={StyleSheet.absoluteFill}
                />
                <ImageBackground
                    source={{ uri: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2565&auto=format&fit=crop" }}
                    style={StyleSheet.absoluteFill}
                    imageStyle={{ opacity: 0.15 }}
                    resizeMode="cover"
                />

                <AdminLoginModal
                    visible={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    onSuccess={onAdminSuccess}
                />

                {/* CONFIRMATION MODAL */}
                <Modal
                    visible={showConfirmModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowConfirmModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Changer de restaurant ?</Text>
                            <Text style={styles.modalText}>
                                Voulez-vous configurer la borne pour : {pendingLoginData?.company_name} ?
                            </Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.btnCancel]}
                                    onPress={() => setShowConfirmModal(false)}
                                >
                                    <Text style={styles.btnCancelText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.btnConfirm]}
                                    onPress={handleConfirmSwitch}
                                >
                                    <Text style={styles.btnConfirmText}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

                        {/* LOGO / BRANDING */}
                        <TouchableOpacity
                            style={[styles.logoContainer, isStandby && styles.logoCentered]}
                            onLongPress={handleResetCompany}
                            delayLongPress={500} // Plus rapide que la seconde par défaut
                            activeOpacity={1}
                        >
                            <Text style={[styles.logoText, { fontSize: isStandby ? 80 : logoSize }]}>🍔 Thiop</Text>
                        </TouchableOpacity>

                        {!isStandby && (
                            <Animated.View style={{ opacity: buttonsFadeAnim, transform: [{ translateY: buttonsTranslateAnim }], width: '100%', alignItems: 'center' }}>
                                <Text style={[styles.question, { fontSize: questionSize }]}>Où souhaitez-vous manger ?</Text>

                                <View style={[styles.buttonsRow, { gap, flexDirection: isSmallScreen ? 'column' : 'row' }]}>
                                    {/* SUR PLACE */}
                                    <TouchableOpacity
                                        style={[styles.card, { width: cardWidth, paddingVertical: isSmallScreen ? 30 : 50 }]}
                                        activeOpacity={0.8}
                                        onPress={() => handleSelection('eat_in')}
                                    >
                                        <View style={[styles.iconCircle, {
                                            width: isSmallScreen ? 80 : 100,
                                            height: isSmallScreen ? 80 : 100,
                                            borderRadius: isSmallScreen ? 40 : 50
                                        }]}>
                                            <Text style={[styles.icon, { fontSize: iconSize }]}>🍽️</Text>
                                        </View>
                                        <Text style={[styles.cardTitle, { fontSize: titleSize }]}>Sur place</Text>
                                    </TouchableOpacity>

                                    {/* A EMPORTER */}
                                    <TouchableOpacity
                                        style={[styles.card, { width: cardWidth, paddingVertical: isSmallScreen ? 30 : 50 }]}
                                        activeOpacity={0.8}
                                        onPress={() => handleSelection('take_out')}
                                    >
                                        <View style={[styles.iconCircle, styles.iconCircleAlt, {
                                            width: isSmallScreen ? 80 : 100,
                                            height: isSmallScreen ? 80 : 100,
                                            borderRadius: isSmallScreen ? 40 : 50
                                        }]}>
                                            <Text style={[styles.icon, { fontSize: iconSize }]}>🛍️</Text>
                                        </View>
                                        <Text style={[styles.cardTitle, { fontSize: titleSize }]}>À emporter</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}

                    </Animated.View>
                </ScrollView>

                {/* FOOTER DECO */}
                {isStandby && (
                    <View style={styles.footer}>
                        <Animated.Text style={[styles.footerText, { opacity: blinkAnim }]}>
                            Touchez l'écran pour commencer
                        </Animated.Text>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    content: {
        alignItems: "center",
        width: "100%",
        maxWidth: 900,
    },
    logoContainer: {
        marginBottom: 40,
        alignItems: "center",
    },
    logoCentered: {
        marginBottom: 0, // Center vertically in standby
        transform: [{ scale: 1.2 }],
    },
    logoText: {
        fontWeight: "900",
        color: "#fff",
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    question: {
        fontWeight: "800",
        color: "#fff",
        marginBottom: 40,
        textAlign: "center",
        paddingHorizontal: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    buttonsRow: {
        alignItems: "center",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 30,
        paddingHorizontal: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircle: {
        backgroundColor: "#FFF0E6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    iconCircleAlt: {
        backgroundColor: "#E6F4FF",
    },
    icon: {
        // fontSize handled dynamically
    },
    cardTitle: {
        fontWeight: "800",
        color: "#333",
    },
    footer: {
        position: "absolute",
        bottom: 80,
        alignSelf: "center",
    },
    footerText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    /* MODAL STYLES */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        maxWidth: 500,
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 26,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnCancel: {
        backgroundColor: '#f0f0f0',
    },
    btnConfirm: {
        backgroundColor: '#000',
    },
    btnCancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#666',
    },
    btnConfirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
