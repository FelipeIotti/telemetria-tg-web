import { telemetryService } from "@/services/telemetry-service";
import { useState } from "react";
import axios from "axios";

export function Settings() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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

  const handleClearData = async (type: "base-data" | "tires" | "gps" | "all") => {
    setIsClearing(true);
    setMessage(null);

    const typeLabels: Record<string, string> = {
      "base-data": "Dados Base",
      "tires": "Pneus",
      "gps": "GPS",
      "all": "Todos os dados",
    };

    try {
      if (type === "base-data") {
        await telemetryService.clearBaseData();
      } else if (type === "tires") {
        await telemetryService.clearTiresData();
      } else if (type === "gps") {
        await telemetryService.clearGpsData();
      } else if (type === "all") {
        await telemetryService.clearAllData();
      }
      setMessage({ 
        text: `${typeLabels[type]} limpos com sucesso!`, 
        type: "success" 
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setMessage({ 
            text: `Erro de conexão: O servidor pode estar indisponível ou a rota /${type === "all" ? "clear-all" : type} não existe no backend.`, 
            type: "error" 
          });
        } else {
          setMessage({ 
            text: `Erro ao limpar ${typeLabels[type].toLowerCase()}: ${error.response.status} - ${error.response.statusText}`, 
            type: "error" 
          });
        }
      } else {
        setMessage({ text: `Erro ao limpar ${typeLabels[type].toLowerCase()}`, type: "error" });
      }
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold">Settings</h1>

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

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Limpar Dados</h2>
        <p className="text-gray-600">
          Limpe dados específicos do banco de dados.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleClearData("all")}
            disabled={isClearing}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isClearing ? "Limpando..." : "Limpar Todos os Dados"}
          </button>

          <button
            onClick={() => handleClearData("base-data")}
            disabled={isClearing}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isClearing ? "Limpando..." : "Limpar Dados Base"}
          </button>

          <button
            onClick={() => handleClearData("tires")}
            disabled={isClearing}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isClearing ? "Limpando..." : "Limpar Dados Pneus"}
          </button>

          <button
            onClick={() => handleClearData("gps")}
            disabled={isClearing}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isClearing ? "Limpando..." : "Limpar Dados GPS"}
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
