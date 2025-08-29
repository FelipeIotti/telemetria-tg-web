import { RotateCw } from "lucide-react";
import { useState, type HTMLAttributes } from "react";
import { Loading } from "../../loading";

interface OrientationButtonProps extends HTMLAttributes<HTMLButtonElement> {
  handleLoadData(): Promise<void>;
}

export function ReloadButton({
  handleLoadData,
  ...rest
}: OrientationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const baseStyle = `bg-white rounded p-2 shadow cursor-pointer`;

  async function loadData() {
    try {
      setIsLoading(true);
      await handleLoadData();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className={baseStyle}
      onClick={() => loadData()}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? <Loading className="h-5 w-5" /> : <RotateCw />}
    </button>
  );
}
