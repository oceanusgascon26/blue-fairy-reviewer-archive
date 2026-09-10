"""Render results-e8.json into READOUT-E8.md. Usage: python readout-e8.py [results.json] [out.md]
Every number is read from the results file; nothing is computed here except percent formatting."""
import json, sys, io

src = sys.argv[1] if len(sys.argv) > 1 else 'results-e8.json'
out = sys.argv[2] if len(sys.argv) > 2 else 'READOUT-E8.md'
d = json.load(io.open(src, encoding='utf-8'))
ARMS = d['arms']
LABEL = {'base': 'Base', 'repair': 'Repair only (unwired stack)', 'integrated': 'Integrated (the wire)', 'supplied': 'Supplied rules',
         'mono': 'Monolithic prompt', 'monoresample': 'Monolithic resampling'}
CLASSES = ['wordcount', 'sentences', 'noletter', 'commas', 'lowercase', 'bullets', 'ending', 'frequency']

pct = lambda x: '%.1f%%' % (100 * x) if x is not None else 'n/a'
pp = lambda x: '%+.1fpp' % (100 * x)
ci = lambda r: '%s [%s, %s]' % (pp(r['mean']), pp(r['lo']), pp(r['hi']))

L = []
L.append('# E8 readout: the machine-checked composition pilot (%s)' % ('SMOKE TEST, scripted fake base, NOT DATA' if d.get('mock') else d['date'][:10]))
L.append('')
L.append('Protocol: PREREGISTRATION-E8.md, frozen by the hashes in FREEZE-E8.txt and registered publicly as osf.io/qc3db before any call. Model %s, temperature %s, maxTokens %s, budget %s generations, %s repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 %s.' % (d['model'], d['temperature'], d['maxTokens'], d['budget'], d['reps'], d['taskSha256'][:16]))
L.append('')
L.append('## Pass rates by repetition')
L.append('')
L.append('| Repetition | ' + ' | '.join(LABEL[a] for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
for rep in d['repetitions']:
    s = rep['summary']
    L.append('| %d, all positions | ' % rep['rep'] + ' | '.join(pct(s[a]['pass']) for a in ARMS) + ' |')
    L.append('| %d, positions 61 to 120 | ' % rep['rep'] + ' | '.join(pct(s[a]['secondHalf']) for a in ARMS) + ' |')
L.append('')
L.append('| Mean calls per task | ' + ' | '.join('%.2f' % (sum(r['summary'][a]['meanCalls'] for r in d['repetitions']) / len(d['repetitions'])) for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
L.append('| Calls, all repetitions | ' + ' | '.join(str(sum(r['summary'][a]['calls'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Input tokens | ' + ' | '.join(str(sum(r['summary'][a]['inputTokens'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Output tokens | ' + ' | '.join(str(sum(r['summary'][a]['outputTokens'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Call errors | ' + ' | '.join(str(sum(r['summary'][a]['errors'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('')
L.append('## Primary outcome')
L.append('')
p = d['primary']
L.append('%s: %s, bootstrap p = %.3f, n = %d prompts.' % (p['comparison'], ci(p), p['p'], p['n']))
L.append('')
L.append('Verdict under the frozen rule: %s.' % d['verdict'])
L.append('')
L.append('## Secondary family (Benjamini-Hochberg, q = 0.05, positions 61 to 120)')
L.append('')
L.append('| Comparison | Difference (95% CI) | p | adjusted p | passes |')
L.append('|---|---|---|---|---|')
for x in d['secondaryFamily']:
    L.append('| %s | %s | %.3f | %.3f | %s |' % (x['comparison'].replace(', positions 61 to 120', ''), ci(x), x['p'], x['pAdjusted'], 'yes' if x['passesBH'] else 'no'))
L.append('')
L.append('## Descriptive')
L.append('')
L.append('Pooled pass rate per arm (mean over prompts of the per-prompt pass averaged over repetitions), all positions and positions 61 to 120:')
L.append('')
L.append('| Arm | All positions | Positions 61 to 120 |')
L.append('|---|---|---|')
for a in ARMS:
    r = d['descriptive']['armRates'][a]
    L.append('| %s | %s [%s, %s] | %s [%s, %s] |' % (LABEL[a], pct(r['all']['mean']), pct(r['all']['lo']), pct(r['all']['hi']), pct(r['secondHalf']['mean']), pct(r['secondHalf']['lo']), pct(r['secondHalf']['hi'])))
L.append('')
L.append('Pass rate by class (all positions, pooled over repetitions):')
L.append('')
L.append('| Class | ' + ' | '.join(LABEL[a] for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
for c in CLASSES:
    L.append('| %s | ' % c + ' | '.join(pct(d['descriptive']['armRates'][a]['byClass'][c]) for a in ARMS) + ' |')
L.append('')
L.append('Learning curve, pass rate by block of twenty positions (pooled over repetitions):')
L.append('')
lc = d['descriptive']['learningCurve']
L.append('| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |')
L.append('|---|---|---|---|---|---|---|')
for a in lc:
    L.append('| %s | ' % LABEL[a] + ' | '.join(pct(v) for v in lc[a]) + ' |')
L.append('')
L.append('Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):')
L.append('')
L.append('| Comparison | Positions 1 to 60 | All positions |')
L.append('|---|---|---|')
for k in d['descriptive']['firstHalf']:
    L.append('| %s | %s | %s |' % (k, ci(d['descriptive']['firstHalf'][k]), ci(d['descriptive']['allPositions'][k])))
L.append('')
L.append('## Lessons written by the integrated arm')
L.append('')
L.append('Lessons written per repetition: %s. Leakage flags (a lesson containing a topic string or not matching the template): %d.' % (' / '.join(str(len(x['written'])) for x in d['lessons']), d['leakageCount']))
L.append('')
for x in d['lessons']:
    L.append('Repetition %d, final store (%d lessons):' % (x['rep'], len(x['final'])))
    L.append('')
    for l in x['final']:
        L.append('- (%s) %s' % (l['id'], l['content']))
    L.append('')
io.open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(L) + '\n')
print('wrote', out, len(L), 'lines')
