import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import { CheckCircle } from '../components/Icons';

const plans = [
  {
    name: 'Iniciante',
    price: 'R$49',
    period: '/mês',
    features: [
      'Acesso ao Coach IA (100 msg/mês)',
      'Acesso à Comunidade Mastermind',
      'Análises de Negócio Básicas',
    ],
    cta: 'Começar Agora',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R$99',
    period: '/mês',
    features: [
      'Acesso Ilimitado ao Coach IA',
      'Acesso à Comunidade Mastermind',
      'Análises de Negócio Avançadas',
      'Templates de Planejamento',
      'Suporte Prioritário',
    ],
    cta: 'Seja Pro',
    popular: true,
  },
  {
    name: 'Mestre',
    price: 'R$299',
    period: '/mês',
    features: [
      'Todos os benefícios do Pro',
      'Sessões de Mentoria em Grupo',
      'Acesso a Workshops Exclusivos',
      'Networking com Especialistas',
      'Consultoria Personalizada (1h/mês)',
    ],
    cta: 'Virar Mestre',
    popular: false,
  },
];

const PricingPage: React.FC = () => {
    const handleSubscription = (planName: string) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: `Processando sua assinatura para o plano ${planName}...`,
                success: `Bem-vindo ao plano ${planName}! Seu negócio está pronto para decolar.`,
                error: 'Houve um problema ao processar seu pagamento.',
            }
        );
    }
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Planos Flexíveis para seu Sucesso</h1>
        <p className="mt-4 text-lg text-gray-400">Escolha o plano que melhor se adapta ao seu momento e acelere seu crescimento.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`h-full flex flex-col ${plan.popular ? 'border-brand-primary border-2' : ''}`}>
              {plan.popular && (
                <div className="bg-brand-primary text-brand-secondary font-bold text-center py-1 text-sm">
                  MAIS POPULAR
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-lg text-gray-400">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-4 text-gray-300 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                    onClick={() => handleSubscription(plan.name)}
                    className="w-full mt-8" 
                    variant={plan.popular ? 'primary' : 'secondary'}
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;