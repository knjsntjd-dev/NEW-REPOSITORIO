#!/usr/bin/env python3
"""Verifica compatibilidade: templates/grupos JSON x schemas das seções, e settings usados no Liquid."""
import json, os, re, glob, sys
T = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'shopify-theme')
err = 0
def schema_of(name):
    p = os.path.join(T, 'sections', name + '.liquid')
    if not os.path.exists(p): return None
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema\s*-?%}', open(p).read(), re.S)
    return json.loads(m.group(1)) if m else {}
def load(p):
    t = re.sub(r'/\*.*?\*/', '', open(p).read(), flags=re.S)
    return json.loads(t)
for p in glob.glob(T + '/templates/**/*.json', recursive=True) + glob.glob(T + '/sections/*.json'):
    d = load(p)
    for sid, s in d.get('sections', {}).items():
        sc = schema_of(s['type'])
        rel = os.path.relpath(p, T)
        if sc is None:
            print(f'ERRO {rel}: seção inexistente {s["type"]}'); err += 1; continue
        ids = {x['id'] for x in sc.get('settings', []) if 'id' in x}
        for k in s.get('settings', {}):
            if k not in ids: print(f'ERRO {rel}: {s["type"]}.settings.{k} não existe no schema'); err += 1
        btypes = {b['type']: {x['id'] for x in b.get('settings', []) if 'id' in x} for b in sc.get('blocks', [])}
        for bid, b in s.get('blocks', {}).items():
            if b['type'].startswith('shopify://'):
                continue
            if b['type'] not in btypes and '@app' not in btypes:
                print(f'ERRO {rel}: bloco {b["type"]} não existe em {s["type"]}'); err += 1; continue
            for k in b.get('settings', {}):
                if b['type'] in btypes and k not in btypes[b['type']]:
                    print(f'ERRO {rel}: {s["type"]} bloco {b["type"]}.{k} não existe'); err += 1
# settings globais usados
gs = {x['id'] for g in json.load(open(T + '/config/settings_schema.json')) for x in g.get('settings', []) if 'id' in x}
for p in glob.glob(T + '/**/*.liquid', recursive=True):
    src = open(p).read()
    for k in set(re.findall(r'(?<![\w.])settings\.([a-z_0-9]+)', src)):
        if k not in gs: print(f'ERRO {os.path.relpath(p, T)}: settings.{k} (global) não existe'); err += 1
# settings de seção usados
for p in glob.glob(T + '/sections/*.liquid'):
    name = os.path.basename(p)[:-7]
    sc = schema_of(name) or {}
    src = open(p).read().split('{% schema %}')[0]
    ids = {x['id'] for x in sc.get('settings', []) if 'id' in x}
    bids = {x['id'] for b in sc.get('blocks', []) for x in b.get('settings', []) if 'id' in x}
    for k in set(re.findall(r'section\.settings\.([a-zA-Z_0-9-]+)', src)) | set(re.findall(r'(?<![\w.])s\.([a-zA-Z_0-9-]+)', src)):
        if k not in ids and k not in ('blocks',): print(f'AVISO {name}: section setting {k} não existe'); err += 1
    for k in set(re.findall(r'block\.settings\.([a-zA-Z_0-9-]+)', src)) | set(re.findall(r'(?<![\w.])b\.([a-zA-Z_0-9-]+)', src)):
        if k not in bids: print(f'AVISO {name}: block setting {k} não existe'); err += 1
print('OK' if not err else f'{err} problema(s)')
sys.exit(1 if err else 0)
