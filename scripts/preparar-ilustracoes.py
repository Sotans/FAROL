"""
Prepara as ilustrações do FAROL a partir dos originais (gerados no Adobe Firefly e no ChatGPT).

- O fundo azul-marinho vira transparência pelo algoritmo "cor para alfa": o brilho das luzes
  continua como luz semitransparente e se mistura com qualquer fundo do app.
- Os 3 estados do farol saem no mesmo enquadramento (a torre não muda de lugar ao acender).
- Os guias saem na mesma escala (altura da cabeça aos pés), para não mudarem de tamanho entre telas.

Uso (precisa de Pillow e numpy):
    python3 -I scripts/preparar-ilustracoes.py assets/ilustracoes/originais assets/ilustracoes
"""
import json, sys
import numpy as np
from PIL import Image

ENTRADA, SAIDA = sys.argv[1], sys.argv[2]

def cor_para_alfa(im):
    a = np.asarray(im.convert('RGB')).astype(np.float64)
    h, w, _ = a.shape
    borda = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3), a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    bg = np.median(borda, axis=0)
    # Algoritmo "color to alpha": o menor alfa que explica o pixel como cor sobre o fundo.
    acima = np.where(a > bg, (a - bg) / np.maximum(255 - bg, 1e-6), 0)
    abaixo = np.where(a < bg, (bg - a) / np.maximum(bg, 1e-6), 0)
    alfa = np.clip(np.max(np.maximum(acima, abaixo), axis=2), 0, 1)
    alfa = np.where(alfa < 0.05, 0, alfa)  # tira o ruído e o degradê leve do fundo
    seguro = np.maximum(alfa, 1e-6)[..., None]
    cor = np.clip((a - bg) / seguro + bg, 0, 255)
    rgba = np.dstack([cor, alfa * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA'), bg

def esmaecer_bordas(img, lados=0.12, base=0.10):
    """O recorte corta o mar em linha reta: as bordas laterais e a de baixo somem aos poucos."""
    a = np.asarray(img).astype(np.float64)
    h, w = a.shape[:2]
    x = np.arange(w)
    rampa_x = np.clip(np.minimum(x, w - 1 - x) / (lados * w), 0, 1)
    y = np.arange(h)
    rampa_y = np.clip((h - 1 - y) / (base * h), 0, 1)
    a[..., 3] *= rampa_x[None, :] * rampa_y[:, None]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def salvar(img, nome, altura=None):
    if altura and img.height != altura:
        img = img.resize((round(img.width * altura / img.height), altura), Image.LANCZOS)
    img.save(f'{SAIDA}/{nome}.webp', 'WEBP', quality=90, method=6)
    return img.size

info = {}
# ---------- Faróis: mesmo enquadramento nos 3 estados ----------
faróis = {'atual': 'farol-atual', 'aceso': 'farol-aceso', 'apagado': 'farol-apagado'}
REF = {}
for estado, n in faróis.items():
    im = Image.open(f'{ENTRADA}/{n}.webp').convert('RGB')
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    centro = slice(int(w * 0.3), int(w * 0.7))
    branco = (a[..., 0] > 150) & (a[..., 1] > 150) & (a[..., 2] > 150)
    azul = (a[..., 2] > 170) & (a[..., 0] < 90)
    torre = (branco | azul)
    torre[:, :int(w * 0.3)] = False
    torre[:, int(w * 0.7):] = False
    # Escala pela largura da faixa azul (o mesmo desenho nos 3 estados) e topo pelo domo azul.
    so_azul = azul.copy()
    so_azul[:, :int(w * 0.3)] = False
    so_azul[:, int(w * 0.7):] = False
    larguras = so_azul.sum(axis=1)
    # só linhas que cabem na torre (as ondas atravessam a imagem e dariam uma largura enorme)
    validas = larguras[(larguras > 0) & (larguras < 0.2 * w)]
    faixa = int(np.percentile(validas, 90))
    ys_az, xs_az = np.nonzero(so_azul)
    topo = ys_az.min()
    cx = int(np.median(xs_az))
    if estado == 'atual':
        REF['faixa'] = faixa
    H = 537
    if estado == 'apagado':
        # A imagem do apagado tem outra escala e outro tom de azul; a máscara falha nela.
        # Medido na imagem original: domo em y=125, base da torre em y=775, eixo em x=838
        # (650 px de torre, contra 540 no estado "atual").
        topo, cx, H = 125, 838, 760  # escala igualada pela largura do domo
    # caixa: 1,15H de largura e 1,3H de altura, com folga acima do domo e abaixo da base (ondas)
    L, A = int(1.15 * H), int(1.3 * H)
    x0, y0 = cx - L // 2, topo - int(0.12 * H)
    rgba, bg = cor_para_alfa(im)
    rec = esmaecer_bordas(rgba.crop((x0, y0, x0 + L, y0 + A)))
    tam = salvar(rec, f'farol-{estado}', altura=480)
    info[estado] = {'H': int(H), 'caixa': [int(x0), int(y0), L, A], 'bg': [round(c) for c in bg], 'tam': tam}
    if estado != 'apagado':
        amarelo = (a[..., 0] > 230) & (a[..., 1] > 170) & (a[..., 2] < 150)
        amarelo[:, :int(w * 0.35)] = False
        amarelo[:, int(w * 0.65):] = False
        ly, lx = np.nonzero(amarelo)
        info[estado]['lampada'] = [round((np.median(lx) - x0) / L, 3), round((np.median(ly) - y0) / A, 3)]

# ---------- Farol da tela inicial: o aceso, com os feixes, em quadro mais largo ----------
im = Image.open(f'{ENTRADA}/farol-aceso.webp').convert('RGB')
rgba, _ = cor_para_alfa(im)
w, h = im.size
x0 = int(w * 0.5 - h * 0.62)
heroi = esmaecer_bordas(rgba.crop((x0, 40, x0 + int(h * 1.24), h)), lados=0.04, base=0.12)
info['heroi'] = {'tam': salvar(heroi, 'farol-heroi', altura=720)}

# ---------- Guias: sem fundo, recortados no contorno e na mesma altura ----------
guias = [
    'administrativo-acenando', 'administrativo-comemorando',
    'tribunais-acenando', 'tribunais-comemorando',
    'policial-acenando', 'policial-comemorando',
]
for nome in guias:
    rgba, bg = cor_para_alfa(Image.open(f'{ENTRADA}/guia-{nome}.webp'))
    al = np.asarray(rgba)[..., 3]
    ys, xs = np.nonzero(al > 40)
    pad = 12
    caixa = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, rgba.width), min(ys.max() + pad, rgba.height))
    rec = rgba.crop(caixa)
    # Mesma escala para todos: a altura do corpo (pixels quase opacos, sem o brilho) vira 820 px.
    opaco = np.asarray(rec)[..., 3] > 230
    oy, ox = np.nonzero(opaco)
    meio = int(np.median(ox))
    faixa = int(0.12 * (ox.max() - ox.min()))
    # cabeça: o ponto opaco mais alto na faixa central (fora do braço erguido e da lanterna)
    cabeca = np.nonzero(opaco[:, meio - faixa:meio + faixa].any(axis=1))[0].min()
    corpo = oy.max() - cabeca
    altura = round(rec.height * 780 / corpo)
    info[nome] = {'tam': salvar(rec, f'guia-{nome}', altura=altura), 'corpo': int(corpo), 'bg': [round(c) for c in bg]}

print(json.dumps(info, indent=1))
