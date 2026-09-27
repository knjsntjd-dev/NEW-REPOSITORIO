#!/usr/bin/env python3
"""Build do tema RODRIGUES Leve v2.

1. Injeta em cada seção o {% schema %} original (tools/original-schemas/*.json),
   garantindo que templates/*.json e config/settings_data.json continuem válidos.
2. Minifica src/theme.js -> shopify-theme/assets/theme.js (terser).
3. Minifica src/theme.css -> shopify-theme/assets/theme.css (lightningcss).
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEME = os.path.join(ROOT, 'shopify-theme')
SCHEMAS = os.path.join(ROOT, 'tools', 'original-schemas')
BIN = os.path.join(ROOT, 'node_modules', '.bin')
SCHEMA_RE = re.compile(r'\n*{%-?\s*schema\s*-?%}.*?{%-?\s*endschema\s*-?%}\s*', re.S)


def inject_schemas():
    n = 0
    for name in sorted(os.listdir(os.path.join(THEME, 'sections'))):
        if not name.endswith('.liquid'):
            continue
        path = os.path.join(THEME, 'sections', name)
        schema_path = os.path.join(SCHEMAS, name.replace('.liquid', '.json'))
        if not os.path.exists(schema_path):
            continue
        src = open(path, encoding='utf-8').read()
        body = SCHEMA_RE.sub('\n', src).rstrip() + '\n'
        schema = json.load(open(schema_path, encoding='utf-8'))
        out = body + '\n{% schema %}\n' + json.dumps(schema, ensure_ascii=False, indent=2) + '\n{% endschema %}\n'
        if out != src:
            open(path, 'w', encoding='utf-8').write(out)
        n += 1
    print(f'schemas: {n} seções')


def run(cmd):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr or r.stdout)


def minify():
    run([os.path.join(BIN, 'terser'), 'src/theme.js', '--compress', 'passes=2', '--mangle', '--ecma', '2020',
         '-o', 'shopify-theme/assets/theme.js'])
    run([os.path.join(BIN, 'lightningcss'), '--minify', '--targets', '>= 0.5%, not dead',
         'src/theme.css', '-o', 'shopify-theme/assets/theme.css'])
    for f in ('theme.js', 'theme.css'):
        p = os.path.join(THEME, 'assets', f)
        print(f'{f}: {os.path.getsize(p) / 1024:.1f} KB')


if __name__ == '__main__':
    inject_schemas()
    minify()
