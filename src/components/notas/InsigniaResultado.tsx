import { Insignia } from "@/components/ui/Insignia";
import type { Resultado } from "@/lib/reglas/nota";

export function InsigniaResultado({ resultado }: { resultado: Resultado }) {
  return <Insignia tono={resultado === "Aprobó" ? "aprobo" : "perdio"}>{resultado}</Insignia>;
}
