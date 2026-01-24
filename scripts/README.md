# 🚀 Guia Rápido: Criação dos 7 Pacotes via API

## ✅ Pré-requisitos

Antes de executar o script, você precisa:

### 1. Chave da Stripe (Test Mode)

1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie a **Secret key** (começa com `sk_test_`)
3. **NÃO compartilhe esta chave publicamente!**

### 2. Adicionar ao arquivo `.env`

Abra o arquivo `.env` na raiz do projeto e adicione:

```env
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
```

### 3. Instalar dependências

O script precisa do módulo `stripe` e `dotenv`:

```bash
npm install stripe dotenv
```

---

## 🎯 Executar o Script

### Passo 1: Abra o terminal na pasta do projeto

```bash
cd "C:\Users\Comunicação\Documents\MESTRE NOS NEGOCIOS -11-01"
```

### Passo 2: Execute o script

```bash
node scripts/createStripeProducts.js
```

### Passo 3: Aguarde a criação

O script irá:
- ✅ Criar 7 produtos na Stripe
- ✅ Criar os preços (prices)
- ✅ Gerar os Payment Links
- ✅ Exibir um resumo formatado

---

## 📋 Saída Esperada

```
🚀 Criando produtos na Stripe...

📌 Usando chave: sk_test_51Abc...

✅ Mestre IA - Starter Pack
   💰 R$ 24.90 | 🔢 50 créditos
   📦 Product ID: prod_xxxxx
   💳 Price ID: price_xxxxx
   🔗 Link: https://buy.stripe.com/xxxxx

... (mais 6 pacotes)

================================================================================
🎉 Todos os produtos foram criados!

📋 RESUMO PARA COPIAR NO ADMIN:

Tier            | Price ID                      | Payment Link
--------------------------------------------------------------------------------
Starter Pack    | price_ABC123...              | https://buy.stripe.com/...
Basic Pack      | price_DEF456...              | https://buy.stripe.com/...
...
```

---

## 📦 Próximos Passos

Após executar o script:

1. **Copie a tabela de resumo** que aparece no final
2. Vá para: **Admin → Custos e Preços → Combo de venda**
3. Para cada combo:
   - Clique em "Criar Novo Combo"
   - Preencha nome, créditos e preço
   - **Cole o Price ID** e **Payment Link** correspondentes
   - Salve

---

## 🆘 Resolução de Problemas

### Erro: "STRIPE_SECRET_KEY não encontrada"
✅ Certifique-se de que adicionou a chave no arquivo `.env`
✅ Certifique-se de que o arquivo está salvo

### Erro: "Cannot find module 'stripe'"
✅ Execute: `npm install stripe dotenv`

### Erro: "Invalid API Key"
✅ Verifique se copiou a chave **completa** da Stripe Dashboard
✅ Certifique-se de que está usando a chave de **Test Mode** (`sk_test_`)

### Erro: "Request timeout"
✅ Verifique sua conexão com a internet
✅ Tente novamente em alguns segundos

---

## 🔒 Segurança

- ✅ **NUNCA** comite o arquivo `.env` no Git
- ✅ O `.env` já está no `.gitignore`
- ✅ Use **Test Mode** (`sk_test_`) para testes
- ✅ Use **Live Mode** (`sk_live_`) apenas em produção

---

## 🎯 Modo Produção

Quando estiver pronto para produção:

1. Acesse: https://dashboard.stripe.com/apikeys (sem /test/)
2. Copie a chave **LIVE**: `sk_live_`
3. Atualize o `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_live_sua_chave_aqui
   ```
4. Execute o script novamente

**⚠️ ATENÇÃO**: Em produção, os produtos criados serão REAIS e cobrarão clientes de verdade!

---

**Alguma dúvida? Estou aqui para ajudar!**
