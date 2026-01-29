import 'dotenv/config';
import admin from 'firebase-admin';

console.log("🔍 Diagnóstico de Chave do Firebase...");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

console.log(`🔹 Project ID: ${projectId || '❌ AUSENTE'}`);
console.log(`🔹 Client Email: ${clientEmail || '❌ AUSENTE'}`);
console.log(`🔹 Private Key (Raw): ${privateKeyRaw ? '✅ PRESENTE' : '❌ AUSENTE'}`);

if (!projectId || !clientEmail || !privateKeyRaw) {
    console.error("❌ ERRO: Variáveis de ambiente faltando no arquivo .env");
    process.exit(1);
}

// Tratamento da Chave
const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

console.log(`🔹 Private Key (Formatada): ${privateKey.includes('-----BEGIN PRIVATE KEY-----') ? '✅ OK (Header detectado)' : '❌ ERRO (Header não encontrado)'}`);
console.log(`🔹 Comprimento da chave: ${privateKey.length} caracteres`);

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log("✅ Firebase Admin Inicializado!");
    } catch (e) {
        console.error("❌ Erro na Inicialização do Admin:", e.message);
        process.exit(1);
    }
}

const db = admin.firestore();

async function testConnection() {
    try {
        console.log("🔄 Tentando ler Firestore (Users)...");
        // Tenta ler qualquer coisa simples, ex: lista vazia ou um doc aleatório
        const snapshot = await db.collection('users').limit(1).get();
        console.log(`✅ SUCESSO! Conexão estabelecida. Documentos encontrados: ${snapshot.size}`);
        console.log("🎉 SUAS CREDENCIAIS DO FIREBASE ESTÃO FUNCIONANDO!");
    } catch (error) {
        console.error("❌ FALHA NA CONEXÃO COM FIRESTORE:");
        console.error(error); // Mostra o erro completo
        console.log("\n💡 DICA: Gere uma nova chave em 'Configurações do Projeto > Contas de Serviço' no Firebase Console.");
    }
}

testConnection();
