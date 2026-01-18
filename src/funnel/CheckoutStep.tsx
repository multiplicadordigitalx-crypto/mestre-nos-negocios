import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { Tiktok, Instagram, Youtube, Facebook } from '../components/Icons';

const socialPlatforms = [
  { name: 'tiktok', icon: <Tiktok className="w-5 h-5 text-gray-400" />, placeholder: "seu.usuario.tiktok" },
  { name: 'instagram', icon: <Instagram className="w-5 h-5 text-gray-400" />, placeholder: "seu.usuario.instagram" },
  { name: 'youtube', icon: <Youtube className="w-5 h-5 text-gray-400" />, placeholder: "c/seu-canal" },
  { name: 'kwai', icon: <span className="font-bold text-gray-400 text-lg">K</span>, placeholder: "seu.usuario.kwai" },
  { name: 'facebook', icon: <Facebook className="w-5 h-5 text-gray-400" />, placeholder: "seu.perfil.facebook" },
];

const CheckoutStep: React.FC = () => {
  const { completePurchase, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    city: '',
    hours: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isFormValid = useMemo(() => {
    const requiredFields: (keyof typeof formData)[] = ['name', 'email', 'phone', 'cpf', 'city', 'hours'];
    return requiredFields.every(field => (formData[field] as string).trim() !== '') && termsAccepted;
  }, [formData, termsAccepted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hours: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await completePurchase({ name: formData.name, email: formData.email, hours: formData.hours });
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Bem-vindo à Comunidade Mestre dos Negócios</h1>
        <p className="text-gray-400 mt-2">Preencha seus dados para garantir sua vaga.</p>
      </div>

      <Card className="!bg-gray-900/60">
        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - Form */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-bold text-white mb-4">1. Seus Dados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nome completo" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Melhor e-mail" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Celular (com DDD)" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required />
                <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} className="sm:col-span-2" required />
              </div>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Qual sua disponibilidade?</h3>
              <div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {['1-2h', '3-4h', '4h+'].map(option => (
                    <label key={option} className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer border border-transparent has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary/10 transition-all">
                      <input type="radio" name="hours" value={option} checked={formData.hours === option} onChange={handleRadioChange} className="w-4 h-4 text-brand-primary bg-gray-600 border-gray-500 focus:ring-brand-primary" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h3>
              <div className="relative border-2 border-brand-primary rounded-lg p-4 text-center mb-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-secondary px-3 py-1 rounded-full text-sm font-bold">
                  OFERTA ESPECIAL
                </div>
                <p className="text-gray-400 line-through">De R$697,00 por apenas:</p>
                <p className="text-4xl font-bold text-white my-1">12x de R$49,70</p>
                <p className="text-gray-300">ou R$497 à vista</p>
              </div>
              <p className="text-sm text-center text-green-400 bg-green-500/10 px-3 py-2 rounded-md mb-auto">
                Você está economizando <span className="font-bold">R$200,00</span> hoje!
              </p>
              <div className="mt-6">
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-5 w-5 mt-0.5 rounded border-gray-500 bg-gray-600 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    Li e aceito a <span className="font-bold text-brand-primary">garantia de 60 dias</span> ou dinheiro de volta. Tenho risco zero.
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4 !py-4 text-lg"
                  isLoading={loading}
                  disabled={!isFormValid || loading}
                >
                  Finalizar compra e ativar acesso
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default CheckoutStep;