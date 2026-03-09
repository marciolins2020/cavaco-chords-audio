import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rzdLogo from "@/assets/logo-rzd-final.png";
import juninhoPhoto from "@/assets/juninho-rezende.png";
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
    <div className="min-h-screen flex bg-background">
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/30" />
        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={juninhoPhoto}
              alt="Juninho Rezende"
              className="h-14 w-14 rounded-full object-cover border-2 border-background/50 shadow-md"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">Juninho Rezende</p>
              <p className="text-xs text-muted-foreground">RZD Music</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl xl:text-4xl font-semibold text-foreground leading-tight mb-3 tracking-tight">
            Domine os acordes
            <br />
            do <span className="italic">cavaquinho</span>.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Dicionário completo com diagramas interativos,
            áudio e prática guiada pelo método RZD.
          </p>

          <div className="grid grid-cols-4 gap-5">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary mb-2">
                  <Icon className="h-4 w-4 text-foreground/70" />
                </div>
                <p className="text-xl font-semibold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
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
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-10">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={rzdLogo} alt="RZD Music" className="h-12 mb-3" />
            <h1 className="text-lg font-semibold">RZD Music</h1>
            <p className="text-sm text-muted-foreground">Acordes de Cavaquinho</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Entre ou crie sua conta para começar.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-5 h-9">
              <TabsTrigger value="signin" className="text-sm">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2.5">
                    {signInError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-sm">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signInEmail}
                    onChange={(e) => { setSignInEmail(e.target.value); setSignInError(""); }}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-sm">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => { setSignInPassword(e.target.value); setSignInError(""); }}
                    required
                    className="h-10"
                  />
                </div>
                <Button type="submit" className="w-full h-10" disabled={signInLoading}>
                  {signInLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && (
                  <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2.5">
                    {signUpError}
                  </div>
                )}
                {signUpSuccess && (
                  <div className="bg-accent/10 border border-accent/20 text-foreground text-sm rounded-md px-3 py-2.5">
                    {signUpSuccess}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signUpName}
                    onChange={(e) => { setSignUpName(e.target.value); setSignUpError(""); }}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signUpEmail}
                    onChange={(e) => { setSignUpEmail(e.target.value); setSignUpError(""); }}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => { setSignUpPassword(e.target.value); setSignUpError(""); }}
                    required
                    minLength={6}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full h-10" disabled={signUpLoading}>
                  {signUpLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ao continuar, você concorda com os termos de uso.
          </p>
        </motion.div>
      </div>
    </div>
  );
}