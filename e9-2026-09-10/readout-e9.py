"""Render results-e9.json into READOUT-E9.md. Usage: python readout-e9.py [results.json] [out.md]
Every number is read from the results file; nothing is computed here except percent formatting."""
import json, sys, io

src = sys.argv[1] if len(sys.argv) > 1 else 'results-e9.json'
out = sys.argv[2] if len(sys.argv) > 2 else 'READOUT-E9.md'
d = json.load(io.open(src, encoding='utf-8'))
ARMS = d['arms']
LABEL = {'base': 'Base', 'repair': 'Repair only (unwired stack)', 'wireA': 'Wire A (E8 template)', 'wireB': 'Wire B (parameter-free)', 'wireC': 'Wire C (parameter-keyed)', 'supplied': 'Supplied rules'}
CLASSES = ['wordcount', 'sentences', 'noletter', 'commas', 'frequency']
pct = lambda x: '%.1f%%' % (100 * x) if x is not None else 'n/a'
pp = lambda x: '%+.1fpp' % (100 * x)
ci = lambda r: '%s [%s, %s]' % (pp(r['mean']), pp(r['lo']), pp(r['hi']))
rci = lambda r: '%s [%s, %s]' % (pct(r['mean']), pct(r['lo']), pct(r['hi']))

L = []
L.append('# E9 readout: the lesson-design follow-up to E8 (%s)' % ('SMOKE TEST, scripted fake base, NOT DATA' if d.get('mock') else d['date'][:10]))
L.append('')
L.append('Protocol: PREREGISTRATION-E9.md, frozen by the hashes in FREEZE-E9.txt and registered publicly on OSF before any call (REGISTRATION-E9.txt). Model %s, temperature %s, maxTokens %s, budget %s generations, %s repetitions of one fixed 120-prompt sequence. Raw call logs in raw/, stores in stores/. Task list sha256 %s.' % (d['model'], d['temperature'], d['maxTokens'], d['budget'], d['reps'], d['taskSha256'][:16]))
L.append('')
L.append('## Pass rates by repetition')
L.append('')
L.append('| Repetition | ' + ' | '.join(LABEL[a] for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
for rep in d['repetitions']:
    s = rep['summary']
    L.append('| %d, all positions | ' % rep['rep'] + ' | '.join(pct(s[a]['pass']) for a in ARMS) + ' |')
    L.append('| %d, positions 61 to 120 | ' % rep['rep'] + ' | '.join(pct(s[a]['secondHalf']) for a in ARMS) + ' |')
    L.append('| %d, first attempts, positions 61 to 120 | ' % rep['rep'] + ' | '.join(pct(s[a]['firstAttemptSecondHalf']) for a in ARMS) + ' |')
L.append('')
L.append('| Mean calls per task | ' + ' | '.join('%.2f' % (sum(r['summary'][a]['meanCalls'] for r in d['repetitions']) / len(d['repetitions'])) for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
L.append('| Calls, all repetitions | ' + ' | '.join(str(sum(r['summary'][a]['calls'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Input tokens | ' + ' | '.join(str(sum(r['summary'][a]['inputTokens'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Output tokens | ' + ' | '.join(str(sum(r['summary'][a]['outputTokens'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Call errors | ' + ' | '.join(str(sum(r['summary'][a]['errors'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('| Prompts with a recalled lesson, all repetitions | ' + ' | '.join(str(sum(r['summary'][a]['promptsWithRecall'] for r in d['repetitions'])) for a in ARMS) + ' |')
L.append('')
L.append('## Primary outcome')
L.append('')
p = d['primary']
L.append('%s: %s, bootstrap p = %.3f, n = %d prompts.' % (p['comparison'], ci(p), p['p'], p['n']))
L.append('')
L.append('Verdict under the frozen rule: %s.' % d['verdict'])
L.append('')
L.append('## Secondary family (Benjamini-Hochberg, q = 0.05, final pass, positions 61 to 120)')
L.append('')
L.append('| Comparison | Difference (95% CI) | p | adjusted p | passes |')
L.append('|---|---|---|---|---|')
for x in d['secondaryFamily']:
    L.append('| %s | %s | %.3f | %.3f | %s |' % (x['comparison'].replace(', positions 61 to 120', ''), ci(x), x['p'], x['pAdjusted'], 'yes' if x['passesBH'] else 'no'))
L.append('')
L.append('## Mechanism outcomes (positions 61 to 120, outside the family)')
L.append('')
L.append('| Arm | First-attempt pass (95% CI) | First attempt minus repair only | Recovered / first-attempt failures |')
L.append('|---|---|---|---|')
m = d['mechanism']
for a in ARMS:
    fa = m['firstAttempt'][a]; dl = m['firstAttemptMinusRepair'].get(a); rc = m['recovery'].get(a)
    L.append('| %s | %s | %s | %s |' % (LABEL[a], rci(fa), ci(dl) if dl else 'reference' if a == 'repair' else 'n/a', ('%d / %d (%s)' % (rc['recovered'], rc['firstAttemptFailures'], pct(rc['rate']))) if rc and rc['rate'] is not None else 'n/a'))
L.append('')
L.append('## Descriptive')
L.append('')
L.append('| Arm | All positions | Positions 61 to 120 |')
L.append('|---|---|---|')
for a in ARMS:
    r = d['descriptive']['armRates'][a]
    L.append('| %s | %s | %s |' % (LABEL[a], rci(r['all']), rci(r['secondHalf'])))
L.append('')
L.append('Pass rate by class, positions 61 to 120 (pooled over repetitions, 12 prompts per class):')
L.append('')
L.append('| Class | ' + ' | '.join(LABEL[a] for a in ARMS) + ' |')
L.append('|---|' + '---|' * len(ARMS))
for c in CLASSES:
    L.append('| %s | ' % c + ' | '.join(pct(d['descriptive']['armRates'][a]['byClassSecondHalf'][c]) for a in ARMS) + ' |')
L.append('')
L.append('Learning curve, pass rate by block of twenty positions (pooled over repetitions):')
L.append('')
lc = d['descriptive']['learningCurve']
L.append('| Arm | 1-20 | 21-40 | 41-60 | 61-80 | 81-100 | 101-120 |')
L.append('|---|---|---|---|---|---|---|')
for a in ARMS:
    L.append('| %s | ' % LABEL[a] + ' | '.join(pct(v) for v in lc[a]) + ' |')
L.append('')
L.append('Same comparisons on positions 1 to 60 and on all positions (descriptive, no inference):')
L.append('')
L.append('| Comparison | Positions 1 to 60 | All positions |')
L.append('|---|---|---|')
for k in d['descriptive']['firstHalf']:
    L.append('| %s | %s | %s |' % (k, ci(d['descriptive']['firstHalf'][k]), ci(d['descriptive']['allPositions'][k])))
L.append('')
L.append('## Lessons written by the wired arms')
L.append('')
L.append('Lessons written per repetition, A / B / C: %s. Wire C prompts that recalled a lesson, per repetition: %s. Leakage flags (a lesson containing a topic string or not matching its template): %d.' % (
    ' | '.join('/'.join(str(len(x['written'])) for x in d['lessons'][a]) for a in ['wireA', 'wireB', 'wireC']), '/'.join(str(v) for v in d['descriptive']['wireCRecalls']), d['leakageCount']))
L.append('')
for a in ['wireA', 'wireB', 'wireC']:
    for x in d['lessons'][a]:
        L.append('%s, repetition %d, final store (%d lessons):' % (LABEL[a], x['rep'], len(x['final'])))
        L.append('')
        for l in x['final']:
            L.append('- (%s) %s' % (l['id'], l['content']))
        L.append('')
io.open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(L) + '\n')
print('wrote', out, len(L), 'lines')
