
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Student, TeamUser } from '../types';
import {
    submitDailyProductStats,
    mockStudents,
    updateStudent,
    getStudents,
    mockSupportAgents,
    mockSalesTeam,
    mockTeamUsers,
    signOut as realSignOut,
    signInWithGoogle as realSignInWithGoogle,
    createAccountAfterPurchase as realCreateAccount,
    getAllUsersFlat,
    updateSupportAgent
} from '../services/mockFirebase';
import { toast } from 'react-hot-toast';

// Fix: Add missing delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PurchaseDetails {
    name: string;
    email: string;
    hours?: string;
    courseId?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isImpersonating: boolean;
    completePurchase: (details: PurchaseDetails) => Promise<void>;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    renewAccess: () => Promise<void>;
    logDailyPosts: (count: number) => Promise<void>;
    refreshUser: () => Promise<void>;
    impersonateUser: (uid: string) => Promise<void>;
    stopImpersonation: () => Promise<void>;
    loginStandalone: (user: any) => void;
    updateProfilePhoto: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LANDING_PAGE_URL = "https://mestredosnegocios.com.br/oferta";
const ADMIN_EMAILS = ['mestrodonegocio01@gmail.com', 'ana@mestredosnegocios.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [failedAttempts, setFailedAttempts] = useState(0);

    const enforceAdminPermissions = (u: User): User => {
        const email = u.email?.toLowerCase() || '';
        if (ADMIN_EMAILS.includes(email) || u.role === 'super_admin' || u.role === 'admin') {
            return {
                ...u,
                hasMestreIA: true,
                dailyMestreIALimit: 9999
            };
        }
        return u;
    };

    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && parsedUser.uid) {
                        setUser(enforceAdminPermissions(parsedUser));
                    }
                }
            } catch (error) {
                console.error("Auth init error", error);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const refreshUser = async () => {
        if (!user) return;
        try {
            const allStudents = await getStudents();
            const updatedStudent = allStudents.find(s => s.uid === user.uid);
            if (updatedStudent) {
                // Sanitização: Garante que objetos aninhados existam
                const sanitizedStudent = {
                    ...updatedStudent,
                    producerData: updatedStudent.producerData || {
                        fullName: '', cpfCnpj: '', email: '', phone: '', address: { zipCode: '', street: '' }, isVerified: false
                    }
                };
                const updatedUser = { ...user, ...sanitizedStudent };
                const finalUser = enforceAdminPermissions(updatedUser);
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
            }
        } catch (e) {
            console.error("Refresh user error", e);
        }
    };

    const completePurchase = async (details: PurchaseDetails) => {
        setLoading(true);
        try {
            const userCredential = await realCreateAccount(details);
            const finalUser = enforceAdminPermissions(userCredential);
            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            toast.success(`Compra finalizada! Bem-vindo(a), ${details.name.split(' ')[0]}!`);
        } catch (error) {
            toast.error('Falha ao processar a compra.');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await realSignOut();
        setUser(null);
        setOriginalUser(null);
        setFailedAttempts(0);
        localStorage.removeItem('user');
        toast.success('Você saiu da sua conta.');
    };

    const loginStandalone = (u: any) => {
        const finalUser = enforceAdminPermissions(u);
        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
    };

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            if (!email || !password) throw new Error('Email e senha são obrigatórios.');

            await delay(1000);
            const normalizedEmail = email.trim().toLowerCase();

            const staffMember = [...mockTeamUsers, ...mockSalesTeam, ...mockSupportAgents].find(u => u.email?.toLowerCase() === normalizedEmail);
            if (staffMember) {
                if ((staffMember as any).password && (staffMember as any).password !== password) {
                    throw new Error("Senha incorreta.");
                }
                let normalizedUser: User;
                if ('id' in staffMember && !('uid' in staffMember)) {
                    const teamUser = staffMember as TeamUser;
                    if (teamUser.status !== 'active') throw new Error("Acesso bloqueado ou inativo.");
                    normalizedUser = { uid: teamUser.id, email: teamUser.email, displayName: teamUser.name, photoURL: teamUser.photoURL, role: teamUser.role, permissions: teamUser.permissions };
                } else {
                    const agent = staffMember as any;
                    normalizedUser = { uid: agent.uid, email: agent.email, displayName: agent.displayName, photoURL: agent.photoURL, role: agent.role, permissions: agent.permissions };
                }
                const finalUser = enforceAdminPermissions(normalizedUser);
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                setFailedAttempts(0);
                toast.success(`Bem-vindo(a), ${finalUser.displayName}!`);
                return;
            }

            const students = await getStudents();
            const student = students.find(s => s.email?.toLowerCase() === normalizedEmail);

            if (student) {
                if ((student as any).password && (student as any).password !== password) {
                    throw new Error("Senha incorreta.");
                }
                const finalUser = enforceAdminPermissions(student);
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                setFailedAttempts(0);
                toast.success(`Bem-vindo(a) de volta, ${student.displayName}!`);
                return;
            }

            throw new Error('Conta não encontrada. Por favor, adquira o curso primeiro.');
        } catch (error: any) {
            handleLoginError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (errorMessage: string) => {
        if (errorMessage === 'Conta não encontrada. Por favor, adquira o curso primeiro.') {
            const currentAttempts = failedAttempts + 1;
            setFailedAttempts(currentAttempts);
            if (currentAttempts >= 3) {
                toast.error('Muitas tentativas falhas. Redirecionando para a oferta...');
                setTimeout(() => window.location.href = LANDING_PAGE_URL, 3000);
            } else {
                toast.error(`${errorMessage} (Tentativa ${currentAttempts}/3)`);
            }
        } else {
            toast.error(errorMessage);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const googleUser = await realSignInWithGoogle();
            if (!googleUser) throw new Error('Conta não encontrada. Por favor, adquira o curso primeiro.');
            const finalUser = enforceAdminPermissions(googleUser);
            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            setFailedAttempts(0);
            toast.success(`Bem-vindo(a), ${googleUser.displayName}!`);
        } catch (error: any) {
            handleLoginError(error.message === 'SECURITY_BLOCK_NO_PURCHASE' ? 'Conta não encontrada. Por favor, adquira o curso primeiro.' : error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setLoading(true);
        await delay(800);
        setLoading(false);
        handleLoginError('Conta não encontrada. Por favor, adquira o curso primeiro.');
    };

    const renewAccess = async () => {
        setLoading(true);
        try {
            await delay(2000);
            if (user) {
                const renewedUser: User = { ...user, purchaseDate: new Date().toISOString() };
                const finalUser = enforceAdminPermissions(renewedUser);
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                toast.success("Acesso renovado com sucesso!");
            }
        } catch (e) {
            toast.error("Erro ao renovar acesso.");
        } finally {
            setLoading(false);
        }
    };

    const logDailyPosts = async (count: number) => {
        if (!user) return;
        setLoading(true);
        try {
            await submitDailyProductStats(user.uid, 'General', count);
            await refreshUser();
            toast.success("Produção registrada!");
        } catch (e) {
            toast.error("Erro ao registrar produção.");
        } finally {
            setLoading(false);
        }
    }

    const updateProfilePhoto = async (file: File) => {
        if (!user) return;
        const toastId = toast.loading("Atualizando foto...");
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const updatedUser = { ...user, photoURL: base64String };
                const finalUser = enforceAdminPermissions(updatedUser);
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                if (user.role === 'student') {
                    await updateStudent(user.uid, { photoURL: base64String });
                } else if (user.role === 'support' || user.role === 'support_agent') {
                    await updateSupportAgent(user.uid, { photoURL: base64String });
                }
                toast.success("Foto de perfil atualizada!", { id: toastId });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error("Erro ao atualizar foto.", { id: toastId });
        }
    };

    const impersonateUser = async (uid: string) => {
        setLoading(true);
        await delay(800);

        const allUsers = await getAllUsersFlat();
        const targetUser = allUsers.find(u => u.uid === uid || (u as any).id === uid);

        if (targetUser) {
            if (!originalUser) setOriginalUser(user);
            // Normaliza o objeto de usuário para o formato User esperado pelo contexto
            const normalizedTarget: User = {
                uid: targetUser.uid || (targetUser as any).id,
                email: targetUser.email,
                displayName: targetUser.displayName || (targetUser as any).name,
                photoURL: targetUser.photoURL || (targetUser as any).avatar,
                role: targetUser.role,
                permissions: (targetUser as any).permissions,
                // Propriedades específicas de aluno se existirem
                ...(targetUser.role === 'student' ? targetUser : {})
            };

            setUser(normalizedTarget);
            toast.success(`Modo Espelho Ativado: ${normalizedTarget.displayName}`);
        } else {
            toast.error("Usuário não encontrado.");
        }
        setLoading(false);
    };

    const stopImpersonation = async () => {
        if (originalUser) {
            setLoading(true);
            await delay(500);
            setUser(originalUser);
            setOriginalUser(null);
            toast.success("Modo de personificação encerrado.");
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, loading, isImpersonating: !!originalUser, completePurchase, signOut, signIn, signInWithGoogle,
            signUp, renewAccess, logDailyPosts, refreshUser, impersonateUser, stopImpersonation, updateProfilePhoto,
            loginStandalone
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
