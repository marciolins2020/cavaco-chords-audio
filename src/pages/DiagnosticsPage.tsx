import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { makeChordId } from "@/lib/chordIds";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Music } from "lucide-react";

const DiagnosticsPage = () => {
  const { chordDatabase } = useApp();
  const [filter, setFilter] = useState<"all" | "zero" | "low" | "good">("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const chords = chordDatabase.chords.map((c) => ({
      root: c.root,
      suffix: c.suffix,
      displayName: c.displayName,
      id: makeChordId(c.root, c.suffix),
      variations: c.variations.length,
      notes: c.notes || [],
    }));

    const total = chords.length;
    const withZero = chords.filter((c) => c.variations === 0).length;
    const withOne = chords.filter((c) => c.variations === 1).length;
    const withMultiple = chords.filter((c) => c.variations >= 2).length;
    const totalVariations = chords.reduce((sum, c) => sum + c.variations, 0);

    return { chords, total, withZero, withOne, withMultiple, totalVariations };
  }, [chordDatabase]);

  const filtered = useMemo(() => {
    let list = stats.chords;

    if (filter === "zero") list = list.filter((c) => c.variations === 0);
    else if (filter === "low") list = list.filter((c) => c.variations === 1);
    else if (filter === "good") list = list.filter((c) => c.variations >= 2);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.root.toLowerCase().includes(q) ||
          c.suffix.toLowerCase().includes(q)
      );
    }

    return list;
  }, [stats.chords, filter, search]);

  // Group by suffix for summary
  const suffixSummary = useMemo(() => {
    const map = new Map<string, { count: number; totalVar: number; zeroCount: number }>();
    stats.chords.forEach((c) => {
      const entry = map.get(c.suffix) || { count: 0, totalVar: 0, zeroCount: 0 };
      entry.count++;
      entry.totalVar += c.variations;
      if (c.variations === 0) entry.zeroCount++;
      map.set(c.suffix, entry);
    });
    return Array.from(map.entries())
      .map(([suffix, data]) => ({ suffix, ...data }))
      .sort((a, b) => b.zeroCount - a.zeroCount || a.suffix.localeCompare(b.suffix));
  }, [stats.chords]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">🔍 Diagnóstico do Banco de Acordes</h1>
        <p className="text-muted-foreground mb-6">
          Versão: {chordDatabase.version} — Validação rápida de cobertura
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total acordes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.withMultiple}</div>
            <div className="text-xs text-muted-foreground">2+ variações</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.withOne}</div>
            <div className="text-xs text-muted-foreground">1 variação</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.withZero}</div>
            <div className="text-xs text-muted-foreground">0 variações</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalVariations}</div>
            <div className="text-xs text-muted-foreground">Total variações</div>
          </Card>
        </div>

        {/* Suffix Summary */}
        <Card className="p-4 mb-8">
          <h2 className="text-lg font-semibold mb-3">Cobertura por tipo</h2>
          <div className="flex flex-wrap gap-2">
            {suffixSummary.map((s) => (
              <Badge
                key={s.suffix}
                variant={s.zeroCount > 0 ? "destructive" : s.totalVar / s.count < 2 ? "secondary" : "default"}
                className="cursor-pointer text-xs"
                onClick={() => {
                  setSearch(s.suffix === "M" ? "" : s.suffix);
                  setFilter("all");
                }}
              >
                {s.suffix === "M" ? "Maior" : s.suffix} ({s.totalVar}/{s.count * 3})
                {s.zeroCount > 0 && ` ⚠${s.zeroCount}`}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Input
            placeholder="Buscar acorde..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({stats.total})</SelectItem>
              <SelectItem value="zero">Sem variações ({stats.withZero})</SelectItem>
              <SelectItem value="low">1 variação ({stats.withOne})</SelectItem>
              <SelectItem value="good">2+ variações ({stats.withMultiple})</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground self-center">
            Mostrando {filtered.length} acordes
          </span>
        </div>

        {/* Chord Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filtered.map((chord) => (
            <Link
              key={chord.id}
              to={`/chord/${chord.id}`}
              className="block"
            >
              <Card
                className={`p-3 text-center transition-all hover:scale-105 hover:shadow-md ${
                  chord.variations === 0
                    ? "border-red-500/50 bg-red-500/5"
                    : chord.variations === 1
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-green-500/20 bg-green-500/5"
                }`}
              >
                <div className="font-bold text-sm">{chord.displayName}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {chord.variations === 0 ? (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  ) : chord.variations >= 2 ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <Music className="w-3 h-3 text-yellow-500" />
                  )}
                  <span
                    className={`text-xs font-mono ${
                      chord.variations === 0
                        ? "text-red-500"
                        : chord.variations === 1
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {chord.variations} var
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum acorde encontrado com os filtros atuais.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DiagnosticsPage;
