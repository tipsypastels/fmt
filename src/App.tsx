import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const BOLD_FORMATS = {
  none: {
    name: 'None',
    transform: (x: string) => x,
  },
  md: {
    name: 'Markdown',
    transform: (x: string) => `**${x}**`,
  },
  bbcode: {
    name: 'BBCode',
    transform: (x: string) => `[b]${x}[/b]`,
  },
  html: {
    name: 'HTML',
    transform: (x: string) => `<strong>${x}</strong>`,
  },
} as const;

const BOLD_FORMAT_IDS = Object.keys(BOLD_FORMATS) as BoldFormat[];
type BoldFormat = keyof typeof BOLD_FORMATS;

type ChangeEvt = React.ChangeEvent<HTMLTextAreaElement>;
type PasteEvt = React.ClipboardEvent<HTMLTextAreaElement>;

const PIN = /(.+)\s*\n\s*pinned\s*\n\s*a message\s*\n\s*to this channel.\s*\n\s*See all the pins\.\s*\n/gm;
const MSG_START = /^\s*(.*)((?:\d{2}\/\d{2}\/\d{4})|(?:(?:Yesterday|Today) at \d{1,2}:\d{2} [AP]M))\s*$/gm;

export default function App() {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const [justCopied, setJustCopied] = useState(false);
  const [boldFormat, setBoldFormat] = useState<BoldFormat>('bbcode');

  useEffect(() => {
    if (justCopied) {
      setTimeout(
        () => setJustCopied(false), 
        1000,
      );
    }
  }, [justCopied]);

  function toBold(value: string) {
    return BOLD_FORMATS[boldFormat].transform(value);
  }

  function transformValue(value: string) {
    const replaced = value
      .replace(PIN, '$1 pinned a message to this channel.')
      .replace(MSG_START, `\n\n${toBold('$1')} $2`);
    setValue(replaced.trim());
  }

  function handleChange(e: ChangeEvt) {
    setValue(e.target.value);
  }

  function handlePaste(e: PasteEvt) {
    const paste = e.clipboardData.getData('Text');
    transformValue(paste);

    const textarea = ref.current!;

    e.preventDefault();
    e.stopPropagation();

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 999999999999999999999999999);
    
    document.execCommand('copy');

    setJustCopied(true);
  }

  return (
    <div className="App">
      <header className="App__header">
        <h1 className="App__title">
          fmt
        </h1>

        <p className="App__tagline">
          paste discord logs to nicely format

          {value && justCopied && (
            <strong>{' '}copied to clipboard!</strong>
          )}
        </p>
      </header>

      <textarea 
        autoFocus
        className="App__text"
        placeholder="Paste discord logs here!"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        ref={ref}
      />

      <footer className="App__footer">
        {BOLD_FORMAT_IDS.map(k => {
          const { name } = BOLD_FORMATS[k];

          return (
            <label className="App__bold-value" key={k}>
              <input
                type="radio"
                checked={k === boldFormat}
                onChange={e => {
                  if (e.target.checked) {
                    setBoldFormat(k);
                  }
                }}
              />

              <div>
                {name}
              </div>
            </label>
          )
        })}
      </footer>
    </div>
  );
}