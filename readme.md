# Fin-Sentiment

Sentiment detection for Fin natural language processor.

- Positive sentiment: positive number.
- Negative sentiment: negative number.
- All other: 0.

## Installation

```
npm i --save fin-sentiment
```

## Usage

```typescript
import * as Fin from "finnlp";
import "fin-sentiment";

const sampleA = "That's not a good book";
const sampleB = "That's a good book";

const resultA = new Fin.Run(sampleA).sentiment();
const resultB = new Fin.Run(sampleB).sentiment();

console.log(resultA);
console.log(resultB);
```

The above example would give:

```javascript
[
    [
        0,
        0,
        0,
        0,
        0,
        -3 // negative because it's negated
    ]
]
```

```javascript
[
    [
        0,
        0,
        0,
        0,
        0,
        3 // positive
    ]
]
```