
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Rocket, Gift, Heart, ShoppingBag } from '../../../components/Icons';
import { Menu } from '@headlessui/react';

export type SeasonalCampaign = 'today' | '7d' | '30d' | 'black_friday' | 'xmas' | 'mothers_day' | 'valentines';

interface SeasonalFilterDropdownProps {
    value: SeasonalCampaign;
    onChange: (value: SeasonalCampaign) => void;
}

export const SeasonalFilterDropdown: React.FC<SeasonalFilterDropdownProps> = ({ value, onChange }) => {

    const campaigns: { id: SeasonalCampaign; label: string; icon: any; color: string }[] = [
        { id: 'today', label: 'Hoje (Real-time)', icon: Calendar, color: 'text-gray-400' },
        { id: '7d', label: 'Últimos 7 Dias', icon: Calendar, color: 'text-gray-400' },
        { id: '30d', label: 'Este Mês', icon: Calendar, color: 'text-gray-400' },
        { id: 'black_friday', label: 'Black Friday', icon: Rocket, color: 'text-purple-400' },
        { id: 'xmas', label: 'Natal', icon: Gift, color: 'text-red-400' },
        { id: 'mothers_day', label: 'Dia das Mães', icon: Heart, color: 'text-pink-400' },
        { id: 'valentines', label: 'Dia dos Namorados', icon: Heart, color: 'text-red-500' },
    ];

    const activeCampaign = campaigns.find(c => c.id === value) || campaigns[2];

    return (
        <Menu as="div" className="relative inline-block text-left z-20">
            <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 transition-colors shadow-sm">
                <activeCampaign.icon className={`w-4 h-4 ${activeCampaign.color}`} />
                <span className="text-sm font-bold text-white">{activeCampaign.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden focus:outline-none divide-y divide-gray-700/50">
                <div className="p-1">
                    <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500">Períodos Padrão</p>
                    {campaigns.slice(0, 3).map((item) => (
                        <Menu.Item key={item.id}>
                            {({ active }) => (
                                <button
                                    onClick={() => onChange(item.id)}
                                    className={`${active ? 'bg-gray-700 text-white' : 'text-gray-300'
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                >
                                    <item.icon className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                                    {item.label}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
                <div className="p-1">
                    <p className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500">Campanhas Sazonais</p>
                    {campaigns.slice(3).map((item) => (
                        <Menu.Item key={item.id}>
                            {({ active }) => (
                                <button
                                    onClick={() => onChange(item.id)}
                                    className={`${active ? 'bg-gray-700 text-white' : 'text-gray-300'
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-bold transition-colors`}
                                >
                                    <item.icon className={`mr-2 h-4 w-4 ${item.color}`} aria-hidden="true" />
                                    {item.label}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
    );
};
