
# Feed Forge Automator - Guida Tecnica per Sviluppatori

## Architettura del Codice

### Contesti React

L'applicazione è basata su un'architettura di contesti React per gestire lo stato globale:

#### 1. ExchangeRateContext (src/contexts/ExchangeRateContext.tsx)

Gestisce i tassi di cambio delle valute e le funzionalità premium.

```typescript
export interface ExchangeRateContextType {
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  addExchangeRate: (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => void;
  updateExchangeRate: (id: string, rate: Partial<ExchangeRate>) => void;
  deleteExchangeRate: (id: string) => void;
  refreshRates: () => Promise<void>;
  rates: Record<string, number>;
  isPremium: boolean;
  isSubscriptionActive?: boolean;
  setSubscriptionActive?: (active: boolean) => void;
}
```

Questo contesto fornisce:
- Metodi CRUD per i tassi di cambio
- Un oggetto `rates` per un facile lookup dei tassi
- Gestione dello stato premium dell'utente
- Funzione di aggiornamento dei tassi

#### 2. ProductContext

Gestisce i dati dei prodotti con funzionalità come:
- Caricamento prodotti
- Filtraggio e ricerca
- Aggiunta, modifica e eliminazione prodotti

#### 3. TemplateContext

Gestisce i template di feed con funzioni per:
- Caricamento template
- CRUD per template e mappature dei campi
- Applicazione delle trasformazioni

#### 4. ConfigContext

Gestisce le configurazioni dell'applicazione:
- Endpoint API
- Preferenze utente
- Impostazioni di autenticazione

### Sistema di Trasformazione Dati

Il sistema di trasformazione è composto da:

#### 1. Tipi di Trasformazione (src/types/index.ts)

```typescript
export type FieldTransformationType = 
  | 'replace' 
  | 'append' 
  | 'prepend' 
  | 'lowercase' 
  | 'uppercase' 
  | 'number_format' 
  | 'substring' 
  | 'currency_conversion';

export interface FieldTransformation {
  type: FieldTransformationType;
  // Proprietà specifiche per ogni tipo
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
```

#### 2. Funzioni di Trasformazione (src/utils/transformations.ts)

Funzioni che implementano la logica di trasformazione per ogni tipo:

```typescript
// Esempio di funzione di trasformazione
export function applyReplaceTransformation(value: string, find: string, replace: string): string {
  if (!value) return value;
  return value.replace(new RegExp(find, 'g'), replace);
}

// Funzione generale che applica qualsiasi trasformazione
export function applyTransformation(value: string, transformation: FieldTransformation): string {
  switch (transformation.type) {
    case 'replace':
      return applyReplaceTransformation(value, transformation.find || '', transformation.replace || '');
    // altri casi...
  }
}

// Funzione che applica in sequenza più trasformazioni
export function applyTransformations(value: string, transformations: FieldTransformation[]): string {
  return transformations.reduce((result, transformation) => {
    return applyTransformation(result, transformation);
  }, value);
}
```

#### 3. UI di Trasformazione (src/components/templates/TransformationEditor.tsx)

Componente React che fornisce l'interfaccia per configurare le trasformazioni:

```typescript
interface TransformationEditorProps {
  transformation: FieldTransformation;
  onUpdate: (transformation: FieldTransformation) => void;
  onDelete: () => void;
}
```

Il componente utilizza un pattern a rendering condizionale per mostrare campi di input specifici per ogni tipo di trasformazione.

### Modelli di Dati

#### 1. Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  brand?: string;
  categories: string[];
  images: string[];
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  attributes: Record<string, string>;
}
```

#### 2. Template

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  format: 'csv' | 'xml' | 'json';
  mappings: FieldMapping[];
  createdAt: string;
  updatedAt: string;
}
```

#### 3. FieldMapping

```typescript
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
```

## Flusso di Generazione Feed

Il processo di generazione dei feed segue questi passaggi:

1. **Selezione prodotti**: L'utente seleziona quali prodotti includere nel feed
2. **Selezione template**: L'utente sceglie un template predefinito per la piattaforma target
3. **Applicazione mappature**: Il sistema applica le mappature dei campi definite nel template
4. **Applicazione trasformazioni**: Per ogni campo mappato, vengono applicate le trasformazioni configurate
5. **Generazione formato**: I dati trasformati vengono formattati secondo il formato richiesto (CSV, XML, JSON)
6. **Esportazione**: Il feed generato viene scaricato o inviato alla piattaforma

```typescript
// Pseudocodice per il flusso di generazione
function generateFeed(products: Product[], template: Template): FeedData {
  return products.map(product => {
    const feedItem: Record<string, any> = {};
    
    for (const mapping of template.mappings) {
      // Ottieni il valore dal prodotto
      let value = product[mapping.sourceField] || mapping.defaultValue || '';
      
      // Applica le trasformazioni
      value = applyTransformations(value, mapping.transformations);
      
      // Assegna al campo di destinazione
      feedItem[mapping.targetField] = value;
    }
    
    return feedItem;
  });
}
```

## Funzionalità Premium

L'applicazione implementa un sistema di funzionalità premium:

1. **Tassi di cambio automatici**: Gli utenti premium possono utilizzare tassi di cambio aggiornati automaticamente per la conversione delle valute
2. **Formati avanzati**: Supporto per formati di feed avanzati
3. **Trasformazioni avanzate**: Tipi di trasformazione aggiuntivi
4. **Integrazione API**: Invio diretto dei feed alle piattaforme

L'accesso alle funzionalità premium è controllato da:

```typescript
const { isPremium } = useExchangeRates();

// Esempio di controllo per funzionalità premium
{isPremium ? (
  <AdvancedFeature />
) : (
  <PremiumBadge message="Upgrade to unlock this feature" />
)}
```

## Guida all'Estensione

### Aggiungere un Nuovo Tipo di Trasformazione

1. Aggiungere il nuovo tipo alla definizione `FieldTransformationType` in `src/types/index.ts`
2. Implementare la funzione di trasformazione in `src/utils/transformations.ts`
3. Aggiungere il caso alla funzione `applyTransformation`
4. Aggiungere l'opzione al menu a discesa in `TransformationEditor.tsx`
5. Implementare l'UI per configurare la nuova trasformazione nel metodo `renderTransformationOptions`

### Aggiungere un Nuovo Formato di Feed

1. Definire il nuovo formato nella definizione `Template` in `src/types/index.ts`
2. Implementare la funzione di generazione in `src/utils/feedGenerators.ts`
3. Aggiungere l'opzione al selettore di formato nel componente `TemplateForm`

## Ottimizzazioni delle Prestazioni

1. **Memorizzazione**: Utilizzo dei React Hooks `useMemo` e `useCallback` per prevenire calcoli ripetuti
2. **Chunking**: Elaborazione di grandi dataset in blocchi per evitare UI bloccanti
3. **Caricamento lazy**: Caricamento differito di componenti pesanti tramite `React.lazy` e `Suspense`

## Sicurezza

1. **Validazione input**: Tutti gli input utente vengono validati prima dell'uso
2. **Sanitizzazione dati**: I dati sono sanitizzati prima di essere visualizzati
3. **Autenticazione**: Sistema di autenticazione per proteggere i dati sensibili

## Debug e Test

1. **Console logs**: L'applicazione utilizza log strategici per aiutare nel debug
2. **Error boundaries**: Implementazione di React Error Boundaries per gestire errori imprevisti
3. **Test unitari**: Funzioni di trasformazione e utility testate con framework di test

## Conclusione

Questa guida tecnica fornisce una panoramica dettagliata dell'architettura e dell'implementazione di Feed Forge Automator. Gli sviluppatori possono usarla come riferimento per comprendere, mantenere ed estendere l'applicazione.

Per domande tecniche o contributi, fare riferimento al repository GitHub o alla documentazione online.
