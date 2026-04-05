import { useState } from 'react';
import { searchYouTube } from '../services/api';

export default function VideoSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await searchYouTube(query);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <form onSubmit={handleSearch} style={s.form}>
        <input
          style={s.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search YouTube..."
        />
        <button type="submit" style={s.searchBtn} disabled={loading}>
          {loading ? <span style={s.spinner} /> : '⌕'}
        </button>
      </form>

      {error && <p style={s.error}>{error}</p>}

      {results.length > 0 && (
        <div style={s.results}>
          {results.map((v) => (
            <div key={v.videoId} style={s.result} onClick={() => onSelect(v)}>
              <img src={v.thumbnail} alt={v.title} style={s.thumb} />
              <div style={s.meta}>
                <p style={s.title}>{v.title}</p>
                <p style={s.channel}>{v.channel}</p>
              </div>
              <button style={s.playBtn} onClick={(e) => { e.stopPropagation(); onSelect(v); }}>
                Request ▶
              </button>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p style={s.noResults}>No results found.</p>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  form: { display: 'flex', gap: 8 },
  input: { flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 14px', color: 'var(--text)', fontSize: 14 },
  searchBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '0 18px', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 46 },
  spinner: { width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  results: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' },
  result: { display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg3)', borderRadius: 8, padding: 8, cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.15s' },
  thumb: { width: 90, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  channel: { fontSize: 11, color: 'var(--text3)', marginTop: 4 },
  playBtn: { background: 'var(--accent-dim)', color: 'var(--accent2)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' },
  error: { color: 'var(--red)', fontSize: 13, padding: '8px 12px', background: 'rgba(255,85,101,0.08)', borderRadius: 8 },
  noResults: { color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 16 },
};
