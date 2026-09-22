import type { NextConfig } from "next";
import { INTESTAZIONI_SICUREZZA } from "./src/lib/intestazioniSicurezza";

const nextConfig: NextConfig = {
  /**
   * Le intestazioni di sicurezza delle pagine.
   *
   * Vivono qui e non solo nel `netlify.toml` perché le pagine le serve la
   * funzione del runtime Next, che le regole del file di Netlify non le
   * applica: là valgono per i file statici. Il perché di ciascuna sta accanto
   * al suo valore, in `src/lib/intestazioniSicurezza.ts`.
   */
  async headers() {
    return [
      {
        source: "/:percorso*",
        headers: INTESTAZIONI_SICUREZZA.map(({ key, value }) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;
