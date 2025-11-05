import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { PracticeStats } from "@/types/practice";
import { getLevelInfo } from "@/utils/achievements";

interface ShareAchievementsProps {
  stats: PracticeStats;
}

export const ShareAchievements = ({ stats }: ShareAchievementsProps) => {
  const levelInfo = getLevelInfo(stats);

  const generateShareImage = async () => {
    const shareCard = document.createElement('div');
    shareCard.style.cssText = `
      width: 600px;
      padding: 40px;
      background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%);
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
      border-radius: 20px;
    `;

    shareCard.innerHTML = `
      <div style="text-align: center;">
        <h1 style="font-size: 32px; margin-bottom: 20px; font-weight: bold;">🎵 Meu Progresso no Cavaquinho</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 20px 0;">
          <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">${stats.chordsMastered.length}</div>
          <div style="font-size: 18px; opacity: 0.9;">Acordes Dominados</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold;">${stats.totalSuccesses}</div>
            <div style="font-size: 14px; opacity: 0.9;">Práticas Bem-sucedidas</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: bold;">${stats.consecutiveDays}</div>
            <div style="font-size: 14px; opacity: 0.9;">Dias Consecutivos</div>
          </div>
        </div>
        <div style="margin-top: 30px; font-size: 20px; opacity: 0.9;">
          Nível: ${levelInfo.level}
        </div>
        <div style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
          RZD - Cavaquinho para Iniciantes
        </div>
      </div>
    `;

    document.body.appendChild(shareCard);

    try {
      const canvas = await html2canvas(shareCard, {
        backgroundColor: null,
        scale: 2,
      });

      document.body.removeChild(shareCard);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'meu-progresso-cavaquinho.png', { type: 'image/png' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Meu Progresso no Cavaquinho',
                text: `Já domino ${stats.chordsMastered.length} acordes no cavaquinho! 🎵`,
              });
              toast.success("Compartilhado com sucesso!");
            } catch (error) {
              if ((error as Error).name !== 'AbortError') {
                downloadImage(canvas);
              }
            }
          } else {
            downloadImage(canvas);
          }
        }
      });
    } catch (error) {
      document.body.removeChild(shareCard);
      toast.error("Erro ao gerar imagem");
      console.error(error);
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = 'meu-progresso-cavaquinho.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Imagem baixada! Compartilhe nas redes sociais.");
  };

  return (
    <Button
      onClick={generateShareImage}
      variant="outline"
      className="w-full gap-2"
    >
      <Share2 className="h-4 w-4" />
      Compartilhar Progresso
    </Button>
  );
};
