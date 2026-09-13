/**
 * Lecture d'un CSV sans dependance externe.
 *
 * Couvre ce que produisent les tableurs : separateur virgule ou point-virgule,
 * champs entre guillemets contenant separateurs et retours a la ligne, et
 * guillemet double echappe ("").
 */

/** Le point-virgule est la norme des tableurs en locale francaise. */
function detectDelimiter(header: string): ',' | ';' {
  let commas = 0;
  let semicolons = 0;
  let quoted = false;

  for (const char of header) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && char === ',') commas += 1;
    else if (!quoted && char === ';') semicolons += 1;
  }

  return semicolons > commas ? ';' : ',';
}

function splitRows(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (quoted) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export interface ParsedCsv {
  columns: string[];
  rows: Record<string, string>[];
}

export function parseCsv(content: string): ParsedCsv {
  // Un fichier exporte par Excel commence souvent par un BOM, qui collerait
  // aux caracteres du premier en-tete et ferait echouer la correspondance.
  const clean = content.replace(/^﻿/, '');
  if (!clean.trim()) return { columns: [], rows: [] };

  const delimiter = detectDelimiter(clean.split('\n')[0] ?? '');
  const [header, ...body] = splitRows(clean, delimiter);
  if (!header) return { columns: [], rows: [] };

  const columns = header.map((name) => name.trim());

  const rows = body
    // Une ligne vide en fin de fichier ne doit pas compter comme une erreur.
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => {
      const row: Record<string, string> = {};
      columns.forEach((column, index) => {
        row[column] = (cells[index] ?? '').trim();
      });
      return row;
    });

  return { columns, rows };
}
