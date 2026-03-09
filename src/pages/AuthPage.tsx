import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rzdLogo from "@/assets/logo-rzd-final.png";
import { useEffect } from "react";

export default function AuthPage() {
  // Separate state per form
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
    // Clear all errors and messages on tab switch
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
      const msg =
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : error.message === "Email not confirmed"
          ? "Confirme seu email antes de entrar."
          : "Erro ao fazer login. Tente novamente.";
      setSignInError(msg);
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
      const msg = error.message?.includes("already registered")
        ? "Este email já está cadastrado. Tente fazer login."
        : error.message?.includes("Password should be at least")
        ? "A senha deve ter no mínimo 6 caracteres."
        : "Erro ao criar conta. Tente novamente.";
      setSignUpError(msg);
    } else {
      setSignUpSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");
    }
    setSignUpLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={rzdLogo} alt="RZD Music" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold text-center">RZD Music</h1>
          <p className="text-muted-foreground text-center">
            Dicionário de Acordes de Cavaquinho
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
                />
              </div>

              <Button type="submit" className="w-full" disabled={signInLoading}>
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
                <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg px-4 py-3">
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
                />
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>

              <Button type="submit" className="w-full" disabled={signUpLoading}>
                {signUpLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-sm">
            ← Voltar para o início
          </Button>
        </div>
      </Card>
    </div>
  );
}
