import { useState } from "react";
import { Upload, Check, AlertCircle, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { validateChordDatabase, ChordDatabase } from "@/constants/chordDatabase";

interface JSONImporterProps {
  onImport: (database: ChordDatabase) => void;
}

export const JSONImporter = ({ onImport }: JSONImporterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (validateChordDatabase(data)) {
        setIsValid(true);
        onImport(data);
        toast.success(`${data.chords.length} acordes importados com sucesso!`, {
          description: `Arquivo: ${file.name}`,
        });
        
        // Fecha o dialog após 1.5 segundos
        setTimeout(() => setIsOpen(false), 1500);
      } else {
        setIsValid(false);
        toast.error("Formato JSON inválido", {
          description: "O arquivo não possui a estrutura correta de acordes.",
        });
      }
    } catch (error) {
      setIsValid(false);
      toast.error("Erro ao ler arquivo", {
        description: error instanceof Error ? error.message : "Arquivo JSON inválido",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      handleFile(file);
    } else {
      toast.error("Tipo de arquivo inválido", {
        description: "Por favor, selecione um arquivo .json",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Importar Acordes</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Importar Banco de Acordes
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo JSON com acordes customizados.
            Os novos acordes serão mesclados com o banco existente.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-border"}
            ${isValid === true ? "border-success bg-success/5" : ""}
            ${isValid === false ? "border-destructive bg-destructive/5" : ""}
          `}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-3">
            {isValid === null && (
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste um arquivo JSON ou clique para selecionar
                </p>
              </>
            )}
            
            {isValid === true && (
              <>
                <Check className="w-12 h-12 text-success" />
                <p className="text-sm font-semibold text-success">
                  Arquivo validado com sucesso!
                </p>
                {fileName && (
                  <p className="text-xs text-muted-foreground">{fileName}</p>
                )}
              </>
            )}
            
            {isValid === false && (
              <>
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-sm font-semibold text-destructive">
                  Formato inválido
                </p>
                {fileName && (
                  <p className="text-xs text-muted-foreground">{fileName}</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p className="font-semibold">Formato esperado:</p>
          <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
{`{
  "chords": [
    {
      "key": "C",
      "suffix": "major",
      "positions": [{
        "frets": [3, 2, 0, 3],
        "fingers": [2, 1, 0, 3],
        "baseFret": 0
      }]
    }
  ]
}`}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};
