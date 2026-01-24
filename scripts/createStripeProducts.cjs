// Script para criar os 7 produtos na Stripe via API
// Execute: node scripts/createStripeProducts.js

require('dotenv').config();
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error('❌ ERRO: STRIPE_SECRET_KEY não encontrada no arquivo .env');
    process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

const CREDIT_PACKAGES = [
    {
        name: 'Mestre IA - Starter Pack',
        description: '50 créditos para começar sua jornada com IA',
        credits: 50,
        price: 2490, // R$ 24,90 em centavos
        tier: 'starter',
        upsell_to: 'credits_100'
    },
    {
        name: 'Mestre IA - Basic Pack',
        description: '100 créditos com 10% de economia',
        credits: 100,
        price: 4490,
        tier: 'basic',
        upsell_to: 'credits_200',
        discount: '10%'
    },
    {
        name: 'Mestre IA - Popular Pack 🔥',
        description: '200 créditos - Nosso pacote MAIS VENDIDO!',
        credits: 200,
        price: 7990,
        tier: 'popular',
        upsell_to: 'credits_300',
        discount: '20%',
        badge: 'most_popular'
    },
    {
        name: 'Mestre IA - Pro Pack',
        description: '300 créditos para profissionais',
        credits: 300,
        price: 10990,
        tier: 'pro',
        upsell_to: 'credits_500',
        discount: '27%'
    },
    {
        name: 'Mestre IA - Business Pack',
        description: '400 créditos para escalar seu negócio',
        credits: 400,
        price: 13990,
        tier: 'business',
        upsell_to: 'credits_500',
        discount: '30%'
    },
    {
        name: 'Mestre IA - Elite Pack ⭐',
        description: '500 créditos - MELHOR custo por crédito!',
        credits: 500,
        price: 16490,
        tier: 'elite',
        upsell_to: 'credits_1000',
        discount: '34%',
        badge: 'best_value'
    },
    {
        name: 'Mestre IA - Enterprise Pack 👑',
        description: '1000 créditos para máximo poder',
        credits: 1000,
        price: 29790,
        tier: 'enterprise',
        upsell_to: null,
        discount: '40%',
        badge: 'premium'
    }
];

const results = [];

async function createProducts() {
    console.log('🚀 Criando produtos na Stripe...\n');
    console.log(`📌 Usando chave: ${stripeSecretKey.substring(0, 10)}...\n`);

    for (const pkg of CREDIT_PACKAGES) {
        try {
            // 1. Criar o produto
            const product = await stripe.products.create({
                name: pkg.name,
                description: pkg.description,
                metadata: {
                    credits: pkg.credits.toString(),
                    tier: pkg.tier,
                    upsell_to: pkg.upsell_to || '',
                    discount: pkg.discount || '',
                    badge: pkg.badge || ''
                }
            });

            // 2. Criar o preço
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: pkg.price,
                currency: 'brl',
                metadata: {
                    credits: pkg.credits.toString()
                }
            });

            // 3. Criar Payment Link
            const paymentLink = await stripe.paymentLinks.create({
                line_items: [{ price: price.id, quantity: 1 }],
                payment_method_types: ['card', 'pix', 'boleto'],
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        url: 'https://www.mestrenosnegocios.com/dashboard?payment=success'
                    }
                }
            });

            const result = {
                name: pkg.name,
                credits: pkg.credits,
                price: `R$ ${(pkg.price / 100).toFixed(2)}`,
                productId: product.id,
                priceId: price.id,
                paymentLink: paymentLink.url,
                tier: pkg.tier
            };

            results.push(result);

            console.log(`✅ ${pkg.name}`);
            console.log(`   💰 ${result.price} | 🔢 ${pkg.credits} créditos`);
            console.log(`   📦 Product ID: ${product.id}`);
            console.log(`   💳 Price ID: ${price.id}`);
            console.log(`   🔗 Link: ${paymentLink.url}`);
            console.log('');

        } catch (error) {
            console.error(`❌ Erro ao criar ${pkg.name}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Todos os produtos foram criados!\n');
    console.log('📋 RESUMO PARA COPIAR NO ADMIN:\n');
    console.log('Nome do Pacote           | Price ID                      | Payment Link');
    console.log('-'.repeat(120));
    results.forEach(r => {
        const nameColumn = r.name.padEnd(25);
        const priceIdColumn = r.priceId.padEnd(30);
        console.log(`${nameColumn} | ${priceIdColumn} | ${r.paymentLink}`);
    });
    console.log('\n👉 **PRÓXIMO PASSO**: Cole esses Price IDs e Links no Admin → Combos de Venda\n');
}

createProducts().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
});
