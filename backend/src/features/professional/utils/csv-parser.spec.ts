import { parseCsv } from './csv-parser';

describe('parseCsv', () => {
  it('reads a comma separated file', () => {
    const { columns, rows } = parseCsv('title,price\nParapente,120');

    expect(columns).toEqual(['title', 'price']);
    expect(rows).toEqual([{ title: 'Parapente', price: '120' }]);
  });

  it('reads the semicolon separator spreadsheets use in French locales', () => {
    const { columns, rows } = parseCsv('title;price\nParapente;120');

    expect(columns).toEqual(['title', 'price']);
    expect(rows).toEqual([{ title: 'Parapente', price: '120' }]);
  });

  it('keeps a separator that sits inside quotes', () => {
    const { rows } = parseCsv('title,description\n"Vol","Haut, très haut"');

    expect(rows[0].description).toBe('Haut, très haut');
  });

  it('unescapes a doubled quote', () => {
    const { rows } = parseCsv('title\n"Le ""grand"" saut"');

    expect(rows[0].title).toBe('Le "grand" saut');
  });

  it('keeps a line break inside a quoted field', () => {
    const { rows } = parseCsv('title,description\nVol,"Ligne 1\nLigne 2"');

    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe('Ligne 1\nLigne 2');
  });

  it('drops the BOM Excel puts before the first header', () => {
    const { columns } = parseCsv('﻿title,price\nVol,10');

    expect(columns[0]).toBe('title');
  });

  it('ignores blank trailing lines', () => {
    const { rows } = parseCsv('title\nVol\n\n');

    expect(rows).toHaveLength(1);
  });

  it('handles CRLF line endings', () => {
    const { rows } = parseCsv('title,price\r\nVol,10\r\n');

    expect(rows).toEqual([{ title: 'Vol', price: '10' }]);
  });

  it('fills missing trailing cells rather than dropping the column', () => {
    const { rows } = parseCsv('title,price\nVol');

    expect(rows[0]).toEqual({ title: 'Vol', price: '' });
  });

  it('returns nothing for an empty file', () => {
    expect(parseCsv('   ')).toEqual({ columns: [], rows: [] });
  });
});
