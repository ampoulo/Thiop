import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { fetchCompanies } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KioskTheme } from '@/constants/theme';

interface Company {
    id: string;
    name: string;
    logo: string | null;
}

interface CompanySelectorProps {
    onSelect: (companyId: string) => void;
}

export default function CompanySelector({ onSelect }: CompanySelectorProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await fetchCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to load companies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (company: Company) => {
        try {
            await AsyncStorage.setItem('selected_company_id', company.id);
            await AsyncStorage.setItem('selected_company_name', company.name);
            onSelect(company.id);
        } catch (error) {
            console.error("Failed to save company selection", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={KioskTheme.colors.primary} />
                <Text style={styles.loadingText}>Chargement des restaurants...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choisissez votre restaurant</Text>
            <ScrollView contentContainerStyle={styles.list} horizontal showsHorizontalScrollIndicator={false}>
                {companies.map((company) => (
                    <TouchableOpacity
                        key={company.id}
                        style={styles.card}
                        onPress={() => handleSelect(company)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoContainer}>
                            {company.logo ? (
                                <Image source={{ uri: company.logo }} style={styles.logo} resizeMode="contain" />
                            ) : (
                                <Text style={styles.placeholderLogo}>🏠</Text>
                            )}
                        </View>
                        <Text style={styles.companyName}>{company.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    list: {
        paddingHorizontal: 20,
        gap: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    logoContainer: {
        width: 100,
        height: 100,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    placeholderLogo: {
        fontSize: 60,
    },
    companyName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
});
