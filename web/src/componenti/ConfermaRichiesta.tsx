import { formattaEuro } from '@/dominio/circuito'
import { contenutiPagine } from '@/contenuti/pagine'

/**
 * Cosa vede il socio dopo aver inviato.
 *
 * Deve dire tre cose e chiuderle: **che la richiesta è partita**, che a
 * rispondere sarà una persona, e — a chi paga con bonifico — dove versare.
 * Se manca una di queste, il socio resta ad aspettare senza sapere se ha
 * fatto tutto, e finisce per telefonare: cioè il fastidio che il modulo
 * esiste per togliere.
 */
export function ConfermaRichiesta({
  esito,
}: {
  esito: { pagamentoBonifico: boolean; importo?: number; causale: string }
}) {
  const { iban, email } = contenutiPagine.associazione

  return (
    <div className="flex flex-col gap-6">
      <div className="pannello border-luce/70 px-5 py-6">
        <h2 className="text-2xl text-chiaro">La richiesta è partita.</h2>
        <p className="mt-3 text-corpo text-lettura">
          Ti risponde un direttore, non un sistema automatico: ti dirà quando e come ritirare.
          Non serve rifare la richiesta se non ricevi subito una risposta.
        </p>
      </div>

      {esito.pagamentoBonifico ? (
        <div className="pannello px-5 py-6">
          <h3 className="text-xl text-chiaro">Come pagare</h3>

          {iban ? (
            <>
              <dl className="mt-4 flex flex-col gap-3">
                <Voce etichetta="IBAN" valore={iban} />
                {esito.importo !== undefined ? (
                  <Voce etichetta="Importo" valore={formattaEuro(esito.importo)} />
                ) : null}
                <Voce etichetta="Causale" valore={esito.causale} />
              </dl>
              {/* Le offerte non hanno un prezzo nel sito: senza questa riga il
                  socio vedrebbe l'IBAN e non saprebbe quanto versare. */}
              {esito.importo === undefined ? (
                <p className="mt-4 text-corpo text-lettura">
                  L’importo te lo scrive il direttore nella risposta: aspetta quella prima di
                  fare il bonifico.
                </p>
              ) : null}
            </>
          ) : (
            /* Meglio dire che manca, che mostrare un numero inventato: un
               IBAN sbagliato manda dei soldi a uno sconosciuto. */
            <p className="mt-3 text-corpo text-lettura">
              L’IBAN e l’importo te li scrive il direttore nella risposta. Non fare nessun
              versamento prima di averli ricevuti da lui.
            </p>
          )}

          <p className="mt-4 text-sm text-tenue">
            Se qualcosa non torna, scrivi a{' '}
            <a
              href={`mailto:${email}`}
              className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
            >
              {email}
            </a>
            .
          </p>
        </div>
      ) : (
        <p className="text-corpo text-lettura">
          L’importo ti verrà trattenuto in busta paga: non devi fare nessun versamento.
        </p>
      )}
    </div>
  )
}

function Voce({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <dt className="text-sm text-tenue">{etichetta}</dt>
      {/* Selezionabile e monospaziato: un IBAN si copia, non si ricopia. */}
      <dd className="font-mono text-corpo text-chiaro select-all">{valore}</dd>
    </div>
  )
}
