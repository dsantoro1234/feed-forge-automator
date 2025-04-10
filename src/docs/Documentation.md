
# Feed Forge Automator - Documentazione Tecnica

## Panoramica dell'Applicazione

Feed Forge Automator è un'applicazione web React progettata per automatizzare la generazione e la trasformazione di feed di dati per diverse piattaforme di e-commerce e marketplace. Questa applicazione consente agli utenti di mappare i loro dati di prodotto in vari formati di feed richiesti dai marketplace e di applicare trasformazioni specifiche ai dati prima dell'esportazione.

## Architettura Frontend

L'applicazione è costruita utilizzando le seguenti tecnologie:

- **React** - Libreria UI
- **TypeScript** - Superset di JavaScript tipizzato
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componenti UI basati su Radix UI
- **React Router** - Gestione del routing
- **React Query** - Gestione delle richieste API e stato dei dati

### Struttura del Progetto

```
src/
├── components/         # Componenti UI riutilizzabili
│   ├── dashboard/      # Componenti specifici per la dashboard
│   ├── layout/         # Componenti di layout (header, footer, ecc.)
│   ├── settings/       # Componenti per la configurazione
│   ├── templates/      # Componenti per la gestione dei template
│   └── ui/             # Componenti UI di base (button, card, ecc.)
├── contexts/           # React context providers
├── data/               # Dati statici e mock data
├── hooks/              # Custom React hooks
├── lib/                # Utilities e funzioni helper
├── pages/              # Componenti pagina
├── types/              # Definizioni TypeScript
└── utils/              # Funzioni utilitarie
```

## Contesti Principali

### ConfigContext

Gestisce le configurazioni globali dell'applicazione, inclusi endpoint API, credenziali e preferenze utente.

### ProductContext

Gestisce i dati dei prodotti, incluso il recupero, la memorizzazione nella cache e la manipolazione.

### TemplateContext

Gestisce i template di feed, che definiscono come i dati dei prodotti vengono mappati ai feed finali.

### ExchangeRateContext

Gestisce i tassi di cambio per le conversioni di valuta, una funzionalità utile quando si esportano feed per marketplace internazionali.

## Sistema di Trasformazione dei Dati

Il cuore dell'applicazione è il sistema di trasformazione che permette agli utenti di modificare i dati prima dell'esportazione. Le trasformazioni disponibili includono:

- **Sostituzione di testo** - Sostituisce parti specifiche del testo
- **Aggiunta prefisso/suffisso** - Aggiunge testo prima o dopo un valore
- **Formattazione numeri** - Formatta i numeri secondo specifiche precise
- **Conversione maiuscolo/minuscolo** - Modifica il caso del testo
- **Substring** - Estrae una porzione di testo
- **Conversione valuta** - Converte valori monetari tra diverse valute

### Componenti Chiave per le Trasformazioni

#### TransformationEditor

Il componente `TransformationEditor` è l'interfaccia utente che permette agli utenti di configurare diverse trasformazioni. Questo componente:

- Visualizza un'interfaccia utente appropriata in base al tipo di trasformazione selezionata
- Permette agli utenti di configurare parametri specifici per ogni tipo di trasformazione
- Salva le trasformazioni nel template associato attraverso il TemplateContext

#### FieldMappingCard

Il componente `FieldMappingCard` gestisce la mappatura tra i campi di origine (prodotti) e i campi di destinazione (feed). Permette agli utenti di:

- Selezionare il campo di origine da un elenco di campi disponibili
- Specificare valori predefiniti quando i campi di origine sono vuoti
- Gestire le trasformazioni applicate a quel campo specifico
- Contrassegnare i campi come richiesti per la validazione

## Conversioni di Valuta

Il sistema di conversione valutaria:

- Supporta conversioni tra USD, EUR, GBP, CAD e altre valute
- Carica i tassi di cambio dal context ExchangeRateContext
- Offre funzionalità premium come l'uso di tassi di cambio aggiornati automaticamente
- Permette l'inserimento manuale dei tassi per gli utenti non premium

## Sistema Premium e Abbonamenti

L'applicazione include:

- Funzionalità base gratuite per tutti gli utenti
- Funzionalità avanzate disponibili solo per utenti premium
- Un sistema di abbonamento implementato tramite l'ExchangeRateContext

## Architettura dei Dati

### Tipi principali

```typescript
// Prodotto
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  // altri campi...
}

// Template
interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  mappings: FieldMapping[];
}

// Mappatura dei campi
interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  isRequired: boolean;
  defaultValue?: string;
  transformations: FieldTransformation[];
  description?: string;
  example?: string;
}

// Trasformazione
interface FieldTransformation {
  type: string; // 'replace', 'append', 'prepend', 'lowercase', 'uppercase', 'number_format', 'substring', 'currency_conversion'
  // Proprietà specifiche per ogni tipo di trasformazione
  find?: string;
  replace?: string;
  value?: string;
  decimals?: number;
  start?: number;
  end?: number;
  fromCurrency?: string;
  toCurrency?: string;
  rate?: number;
}

// Tasso di cambio
interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: string;
}
```

## Flusso dei Dati

1. I dati dei prodotti vengono caricati dal ProductContext
2. Gli utenti creano e configurano template attraverso TemplateContext
3. Gli utenti definiscono mappature tra campi prodotto e campi feed
4. Gli utenti aggiungono trasformazioni alle mappature dei campi
5. Il sistema applica le mappature e le trasformazioni per generare i feed finali
6. I feed generati possono essere esportati in vari formati (CSV, XML, JSON)

## Implementazione delle Trasformazioni

Le trasformazioni dei dati vengono eseguite tramite funzioni specifiche nel file `src/utils/transformations.ts`. Queste funzioni:

1. Accettano un valore di input e parametri di configurazione
2. Applicano la trasformazione specificata
3. Restituiscono il valore trasformato

Ad esempio, la trasformazione di sostituzione di testo cerca occorrenze di una stringa nel testo di input e le sostituisce con un'altra stringa specificata.

## Esportazione e Generazione Feed

Il processo di generazione dei feed:

1. Recupera tutti i prodotti rilevanti dal ProductContext
2. Carica il template selezionato dal TemplateContext
3. Per ogni prodotto, applica le mappature e le trasformazioni definite nel template
4. Genera il feed nel formato richiesto utilizzando le funzioni in `src/utils/feedGenerators.ts`
5. Fornisce il feed generato per il download o l'invio diretto alla piattaforma

## Estensibilità

L'architettura è progettata per essere facilmente estensibile:

- Nuovi tipi di trasformazione possono essere aggiunti aggiornando il `TransformationEditor` e le funzioni in `transformations.ts`
- Nuovi formati di feed possono essere supportati aggiungendo nuovi generatori in `feedGenerators.ts`
- Nuove piattaforme possono essere aggiunte con i loro specifici requisiti di campo

## Conclusione

Feed Forge Automator è un'applicazione potente e flessibile per la gestione e la trasformazione dei feed di prodotti. La sua architettura modulare consente facili estensioni e personalizzazioni, mentre l'interfaccia utente intuitiva rende semplice la configurazione anche per utenti non tecnici.
