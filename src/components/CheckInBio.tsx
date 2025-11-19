import React, { useState, useEffect } from 'react';
import { Activity, Moon, Sun, Zap, Brain, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiService } from '../services/apiService';
import { BioAnalytics } from '../types';

interface CheckInBioProps {
    userId: string;
    onComplete: () => void;
}

const CheckInBio: React.FC<CheckInBioProps> = ({ userId, onComplete }) => {
    const [horasSono, setHorasSono] = useState<number>(7);
    const [qualidadeSono, setQualidadeSono] = useState<number>(7);
    const [nivelFoco, setNivelFoco] = useState<number>(5);
    const [nivelEstresse, setNivelEstresse] = useState<number>(3);
    const [nivelFadiga, setNivelFadiga] = useState<number>(3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<BioAnalytics | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [userId]);

    const loadAnalytics = async () => {
        try {
            setLoadingAnalytics(true);
            const data = await apiService.getBioAnalytics(userId);
            setAnalytics(data);
        } catch (err) {
            console.error('Erro ao carregar analytics:', err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await apiService.createCheckIn({
                userId,
                horasSono,
                qualidadeSono,
                nivelFoco,
                nivelEstresse,
                nivelFadiga,
                origemDados: 'MANUAL'
            });
            await loadAnalytics(); // Refresh analytics
            // Optional: onComplete(); if we want to leave the page immediately
        } catch (err) {
            console.error('Erro ao enviar check-in:', err);
            setError('Falha ao enviar check-in. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlider = (
        label: string,
        value: number,
        setValue: (val: number) => void,
        min: number,
        max: number,
        icon: React.ReactNode,
        colorClass: string
    ) => (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={0.5}
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Baixo</span>
                <span>Alto</span>
            </div>
        </div>
    );

    const renderAnalytics = () => {
        if (!analytics || !analytics.hasData) return null;

        return (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Score */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Health Score</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-indigo-600">{analytics.healthScore}</span>
                        <span className="text-sm text-gray-400 mb-1">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Baseado em sono, foco e estresse</p>
                </div>

                {/* Trends */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Tendências (vs. Semana Anterior)</h3>

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Foco</span>
                        <div className="flex items-center gap-1">
                            {analytics.trends?.foco.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {analytics.trends?.foco.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {analytics.trends?.foco.direction === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                            <span className={`text-sm font-bold ${analytics.trends?.foco.direction === 'up' ? 'text-green-600' :
                                    analytics.trends?.foco.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                {Math.abs(analytics.trends?.foco.percentage || 0).toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estresse</span>
                        <div className="flex items-center gap-1">
                            {analytics.trends?.estresse.direction === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                            {analytics.trends?.estresse.direction === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                            {analytics.trends?.estresse.direction === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                            <span className={`text-sm font-bold ${analytics.trends?.estresse.direction === 'down' ? 'text-green-600' :
                                    analytics.trends?.estresse.direction === 'up' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                {Math.abs(analytics.trends?.estresse.percentage || 0).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Alertas</h3>
                    {analytics.alerts.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="w-5 h-5" />
                            <span>Tudo certo!</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {analytics.alerts.map((alert, idx) => (
                                <div key={idx} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50 text-red-700' :
                                        alert.severity === 'warning' ? 'bg-amber-50 text-amber-700' :
                                            'bg-blue-50 text-blue-700'
                                    }`}>
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8" />
                        Check-in Diário
                    </h2>
                    <p className="opacity-90">
                        Registre como você está se sentindo hoje para receber recomendações personalizadas.
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Sono</h3>
                                {renderSlider(
                                    "Horas de Sono",
                                    horasSono,
                                    setHorasSono,
                                    0,
                                    12,
                                    <Moon className="w-5 h-5 text-indigo-500" />,
                                    "text-indigo-600"
                                )}
                                {renderSlider(
                                    "Qualidade (0-10)",
                                    qualidadeSono,
                                    setQualidadeSono,
                                    0,
                                    10,
                                    <Sun className="w-5 h-5 text-amber-500" />,
                                    "text-amber-600"
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Estado Mental</h3>
                                {renderSlider(
                                    "Nível de Foco",
                                    nivelFoco,
                                    setNivelFoco,
                                    0,
                                    10,
                                    <Brain className="w-5 h-5 text-blue-500" />,
                                    "text-blue-600"
                                )}
                                {renderSlider(
                                    "Nível de Estresse",
                                    nivelEstresse,
                                    setNivelEstresse,
                                    0,
                                    10,
                                    <Zap className="w-5 h-5 text-red-500" />,
                                    "text-red-600"
                                )}
                                {renderSlider(
                                    "Nível de Fadiga",
                                    nivelFadiga,
                                    setNivelFadiga,
                                    0,
                                    10,
                                    <Activity className="w-5 h-5 text-orange-500" />,
                                    "text-orange-600"
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            {onComplete && (
                                <button
                                    type="button"
                                    onClick={onComplete}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Voltar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                  ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95'}
                `}
                            >
                                {isSubmitting ? 'Enviando...' : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Confirmar Check-in
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {renderAnalytics()}
                </div>
            </div>
        </div>
    );
};

export default CheckInBio;
