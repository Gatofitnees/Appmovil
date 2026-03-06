
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, LockKeyhole, ArrowLeft, CheckCircle2, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/onboarding/auth/BackButton";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import GatofitAILogo from "@/components/GatofitAILogo";

type RecoveryStep = "email" | "otp" | "new-password" | "success";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<RecoveryStep>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (step === "otp") {
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    const handleSendCode = async () => {
        if (!email) {
            toast.error({ title: "Error", description: "Por favor ingresa tu email" });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("send-recovery-code", {
                body: { email }
            });

            if (error) throw error;

            setStep("otp");
            toast.show({
                title: "Código enviado",
                description: "Revisa tu bandeja de entrada (y spam)",
            });
        } catch (err: any) {
            console.error("Error sending code:", err);
            toast.error({
                title: "Error",
                description: err.message || "No se pudo enviar el código"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const paste = value.slice(0, 6).split("");
            const newOtp = [...otp];
            paste.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            otpRefs.current[Math.min(index + paste.length - 1, 5)]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = () => {
        const fullOtp = otp.join("");
        if (fullOtp.length < 6) {
            toast.error({ title: "Error", description: "Ingresa el código completo" });
            return;
        }
        setStep("new-password");
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error({ title: "Error", description: "Completa todos los campos" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error({ title: "Error", description: "Las contraseñas no coinciden" });
            return;
        }

        if (newPassword.length < 6) {
            toast.error({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres" });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("reset-password", {
                body: {
                    email,
                    code: otp.join(""),
                    newPassword
                }
            });

            if (error) throw error;

            setStep("success");
        } catch (err: any) {
            console.error("Error resetting password:", err);
            toast.error({
                title: "Error",
                description: err.message || "No se pudo cambiar la contraseña"
            });
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <OnboardingLayout currentStep={20} totalSteps={20}>
            <div className="flex flex-col flex-1 h-full">
                {step !== "success" && (
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">
                            {step === "email" && "Recuperar contraseña"}
                            {step === "otp" && "Verificar código"}
                            {step === "new-password" && "Nueva contraseña"}
                        </h1>
                        <p className="text-muted-foreground">
                            {step === "email" && "Ingresa tu email para recibir un código de recuperación."}
                            {step === "otp" && `Hemos enviado un código de 6 dígitos a ${email}`}
                            {step === "new-password" && "Crea una nueva contraseña segura para tu cuenta."}
                        </p>
                    </div>
                )}

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {step === "email" && (
                            <motion.div
                                key="email"
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Email</label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nombre@ejemplo.com"
                                            className="neu-input pl-10 h-14"
                                            disabled={loading}
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendCode}
                                    disabled={loading || !email}
                                    className="w-full py-6 bg-primary text-white rounded-xl font-bold shadow-neu-button active:shadow-neu-button-active transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            Enviar código
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div
                                key="otp"
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-8"
                            >
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            type="tel"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-12 h-14 text-center text-xl font-bold bg-secondary/20 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otp.some(d => !d)}
                                        className="w-full py-6 bg-primary text-white rounded-xl font-bold shadow-neu-button active:shadow-neu-button-active transition-all"
                                    >
                                        Verificar código
                                    </button>

                                    <button
                                        onClick={handleSendCode}
                                        disabled={loading}
                                        className="w-full text-center text-sm text-primary font-medium"
                                    >
                                        Reenviar código
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "new-password" && (
                            <motion.div
                                key="password"
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Nueva contraseña</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Mínimo 6 caracteres"
                                                className="neu-input pl-10 h-14"
                                                disabled={loading}
                                            />
                                            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                disabled={loading}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Confirmar contraseña</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repite tu contraseña"
                                                className="neu-input pl-10 h-14"
                                                disabled={loading}
                                            />
                                            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleResetPassword}
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="w-full py-6 bg-primary text-white rounded-xl font-bold shadow-neu-button active:shadow-neu-button-active transition-all flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : "Cambiar contraseña"}
                                </button>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center space-y-6 pt-10"
                            >
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">¡Todo listo!</h2>
                                    <p className="text-muted-foreground">Tu contraseña ha sido actualizada correctamente.</p>
                                </div>
                                <button
                                    onClick={() => navigate("/onboarding/login")}
                                    className="w-full py-6 bg-primary text-white rounded-xl font-bold shadow-neu-button hover:bg-primary/90 transition-all"
                                >
                                    Iniciar sesión
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {step !== "success" && (
                    <div className="mt-auto pb-10">
                        <BackButton onBack={() => step === "email" ? navigate("/onboarding/login") : setStep(step === "otp" ? "email" : "otp")} />
                    </div>
                )}
            </div>
        </OnboardingLayout>
    );
};

export default ForgotPassword;
