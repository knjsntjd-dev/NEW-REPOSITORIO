"""Gera preview.html: flexfit.html com fotos embutidas (vídeos .mp4 ficam por caminho, para o ficheiro não pesar ~19MB) e rastreio (Pixel/CAPI) bloqueado,
para ver a página no painel lateral sem mandar eventos falsos ao Meta."""
import base64, mimetypes, pathlib, re
d = pathlib.Path(__file__).parent
html = (d / 'flexfit.html').read_text(encoding='utf-8')
def inline(m):
    p = d / m.group(0)
    if not p.is_file(): return m.group(0)
    mt = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return f"data:{mt};base64,{base64.b64encode(p.read_bytes()).decode()}"
html = re.sub(r"assets/(?!video/.*\.mp4)[^\"'\s)]+", inline, html)
csp = ("<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self' data: blob:; "
       "script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; connect-src 'none'\">")
html = html.replace('<head>', '<head>\n' + csp, 1)
(d / 'preview.html').write_text(html, encoding='utf-8')
print('preview.html', round(len(html) / 1e6, 1), 'MB')
