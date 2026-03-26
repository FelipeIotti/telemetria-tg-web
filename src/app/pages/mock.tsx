import { telemetryService } from "@/services/telemetry-service";
import { useState } from "react";
import axios from "axios";

export function MockPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleGenerateData = async (erase: boolean) => {
    setIsGenerating(true);
    setMessage(null);

    try {
      await telemetryService.mockData({ erase });
      setMessage({ 
        text: erase ? "Dados limpos e novos dados gerados!" : "Novos dados gerados!", 
        type: "success" 
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? `Erro ao gerar dados: ${error.message}` 
        : "Erro ao gerar dados";
      setMessage({ text: errorMessage, type: "error" });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold">Mock Data</h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Dados Mockados</h2>
        <p className="text-gray-600">
          Gere dados mockados para testes de telemetria.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleGenerateData(true)}
            disabled={isGenerating}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isGenerating ? "Gerando..." : "Limpar e Gerar Novos Dados"}
          </button>

          <button
            onClick={() => handleGenerateData(false)}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isGenerating ? "Gerando..." : "Gerar Dados (Sem Limpar)"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
