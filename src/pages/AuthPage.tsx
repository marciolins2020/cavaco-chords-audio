import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rzdLogo from "@/assets/logo-rzd-final.png";
import authBg from "@/assets/auth-bg-music.jpg";
import { motion } from "framer-motion";
import { Music, Users, Trophy, BookOpen } from "lucide-react";

export default function AuthPage() {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleTabChange = () => {
    setSignInError("");
    setSignUpError("");
    setSignUpSuccess("");
    setSignInLoading(false);
    setSignUpLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    if (error) {
      setSignInError(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : error.message === "Email not confirmed"
          ? "Confirme seu email antes de entrar."
          : "Erro ao fazer login. Tente novamente."
      );
    } else {
      navigate("/");
    }
    setSignInLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpSuccess("");
    setSignUpLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName);
    if (error) {
      setSignUpError(
        error.message?.includes("already registered")
          ? "Este email já está cadastrado. Tente fazer login."
          : error.message?.includes("Password should be at least")
          ? "A senha deve ter no mínimo 6 caracteres."
          : "Erro ao criar conta. Tente novamente."
      );
    } else {
      setSignUpSuccess("Conta criada! Verifique seu email para confirmar.");
    }
    setSignUpLoading(false);
  };

  const stats = [
    { icon: Music, value: "150+", label: "Acordes" },
    { icon: BookOpen, value: "12", label: "Tonalidades" },
    { icon: Users, value: "500+", label: "Alunos" },
    { icon: Trophy, value: "∞", label: "Prática" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding & background */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10">
          <motion.img
            src={rzdLogo}
            alt="RZD Music"
            className="h-14 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
            Domine os acordes
            <br />
            do <span className="italic">cavaquinho</span>.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Seu dicionário completo de acordes com diagramas interativos,
            áudio e prática guiada pelo método RZD.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-foreground/5 mb-2">
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RZD Music — Juninho Rezende
          </p>
        </div>
      </div>

      {/* Right side — auth form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-background">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={rzdLogo} alt="RZD Music" className="h-14 mb-3" />
            <h1 className="text-xl font-bold">RZD Music</h1>
            <p className="text-sm text-muted-foreground">Acordes de Cavaquinho</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo</h2>
            <p className="text-muted-foreground mt-1">
              Entre ou crie sua conta para começar.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                    {signInError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signInEmail}
                    onChange={(e) => { setSignInEmail(e.target.value); setSignInError(""); }}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => { setSignInPassword(e.target.value); setSignInError(""); }}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={signInLoading}>
                  {signInLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                    {signUpError}
                  </div>
                )}
                {signUpSuccess && (
                  <div className="bg-primary/10 border border-primary/30 text-foreground text-sm rounded-lg px-4 py-3">
                    {signUpSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signUpName}
                    onChange={(e) => { setSignUpName(e.target.value); setSignUpError(""); }}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signUpEmail}
                    onChange={(e) => { setSignUpEmail(e.target.value); setSignUpError(""); }}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => { setSignUpPassword(e.target.value); setSignUpError(""); }}
                    required
                    minLength={6}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={signUpLoading}>
                  {signUpLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Ao continuar, você concorda com os termos de uso.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
