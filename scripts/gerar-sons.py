"""Gera os sons PROVISÓRIOS do FAROL por síntese (ver docs/08-design-sensorial.md, seção 4).

Timbre de sino: fundamental + dois parciais fracos, com decaimento exponencial.
Escala única (pentatônica de Dó) para que os sons combinem entre si.
Uso: python -I gerar-sons.py <pasta de saída>
"""
import math
import os
import struct
import sys
import wave

TAXA = 44100


def sino(freq, dur, amp=0.5, decai=6.0, ataque=0.004):
    n = int(TAXA * dur)
    amostras = []
    for i in range(n):
        t = i / TAXA
        env = math.exp(-decai * t)
        if t < ataque:
            env *= t / ataque
        v = (
            math.sin(2 * math.pi * freq * t)
            + 0.28 * math.sin(2 * math.pi * freq * 2.0 * t)
            + 0.12 * math.sin(2 * math.pi * freq * 2.76 * t)
        )
        amostras.append(amp * env * v / 1.4)
    return amostras


def silencio(dur):
    return [0.0] * int(TAXA * dur)


def mixar(*faixas):
    """Cada faixa é (inicio_em_segundos, amostras). Soma com sobreposição."""
    fim = max(int(TAXA * ini) + len(a) for ini, a in faixas)
    saida = [0.0] * fim
    for ini, a in faixas:
        base = int(TAXA * ini)
        for i, v in enumerate(a):
            saida[base + i] += v
    return saida


def salvar(nome, amostras, pasta):
    pico = max(1e-6, max(abs(v) for v in amostras))
    ganho = min(1.0, 0.9 / pico)
    with wave.open(os.path.join(pasta, nome), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * ganho)) * 32767)) for v in amostras))


# Pentatônica de Dó, a partir de C5.
C5, D5, E5, G5, A5, C6, D6, E6, G6 = 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98
escada = [C5, E5, G5, A5, C6, E6]


def principal(pasta):
    os.makedirs(pasta, exist_ok=True)

    # Toque leve ao pressionar.
    salvar("toque.wav", sino(A5 * 2, 0.06, amp=0.25, decai=40), pasta)

    # Acertos em sequência: a nota sobe a cada acerto (1 a 5).
    for n in range(1, 6):
        base = escada[n - 1]
        alto = escada[n]
        salvar(f"acerto-{n}.wav", mixar((0.0, sino(base, 0.25, amp=0.45, decai=9)), (0.09, sino(alto, 0.32, amp=0.5, decai=8))), pasta)

    # Erro: nota grave e macia, sem buzina.
    salvar("erro.wav", sino(C5 / 2, 0.42, amp=0.35, decai=7), pasta)

    # Luz apagada no desafio: grave, com fade.
    salvar("luz-apagada.wav", mixar((0.0, sino(E5 / 2, 0.5, amp=0.3, decai=5)), (0.12, sino(C5 / 2, 0.5, amp=0.25, decai=5))), pasta)

    # Lição concluída: acorde de sino em arpejo.
    salvar("licao.wav", mixar((0.0, sino(C5, 1.0, amp=0.4, decai=3.5)), (0.12, sino(E5, 1.0, amp=0.4, decai=3.5)), (0.24, sino(G5, 1.1, amp=0.4, decai=3.2)), (0.38, sino(C6, 1.3, amp=0.45, decai=2.8))), pasta)

    # Meta do dia e mapa: sino mais longo, com três pulsos como um farol.
    salvar("meta.wav", mixar((0.0, sino(G5, 0.9, amp=0.4, decai=4)), (0.3, sino(G5, 0.9, amp=0.4, decai=4)), (0.6, sino(C6, 1.4, amp=0.5, decai=2.5)), (0.6, sino(E6, 1.4, amp=0.3, decai=2.5))), pasta)

    # Pop-up da próxima lição: subida suave.
    n = int(TAXA * 0.4)
    swell = []
    for i in range(n):
        t = i / TAXA
        env = min(1.0, t / 0.18) * math.exp(-5 * max(0.0, t - 0.18))
        swell.append(0.3 * env * (math.sin(2 * math.pi * E5 * t) + 0.3 * math.sin(2 * math.pi * B_(E5) * t)) / 1.3)
    salvar("popup.wav", swell, pasta)

    # Farol (celebrações grandes): arpejo subindo e nota sustentada.
    salvar("farol.wav", mixar((0.0, sino(C5, 0.8, amp=0.35, decai=4)), (0.1, sino(E5, 0.8, amp=0.35, decai=4)), (0.2, sino(G5, 0.9, amp=0.35, decai=4)), (0.3, sino(C6, 1.0, amp=0.4, decai=3.5)), (0.42, sino(E6, 1.1, amp=0.4, decai=3)), (0.56, sino(G6, 1.8, amp=0.5, decai=1.8)), (0.56, sino(C6, 1.8, amp=0.25, decai=1.8))), pasta)


def B_(f):
    return f * 1.5


if __name__ == "__main__":
    principal(sys.argv[1])
    print("sons gerados em", sys.argv[1])
