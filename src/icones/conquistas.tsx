import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';

import { cor } from '@/tema/tokens';
import type { PropsIcone } from './tipos';

/**
 * Ícones de marca e conquista (docs/08-design-sensorial.md, seção 5).
 * Linguagem da luz: toda conquista acende uma luz. Formas geométricas simples, poucas cores.
 */

/** Pontos de uma estrela de `pontas` pontas, centrada em (cx, cy). */
export function pontosDeEstrela(cx: number, cy: number, pontas: number, externo: number, interno: number): string {
  const pontos: string[] = [];
  for (let i = 0; i < pontas * 2; i += 1) {
    const raio = i % 2 === 0 ? externo : interno;
    const angulo = (Math.PI / pontas) * i - Math.PI / 2;
    pontos.push(`${(cx + raio * Math.cos(angulo)).toFixed(2)},${(cy + raio * Math.sin(angulo)).toFixed(2)}`);
  }
  return pontos.join(' ');
}

export type EstadoDoFarol = 'apagado' | 'atual' | 'aceso';

/** O farol: símbolo do app e nó que fecha cada módulo. Aceso, lança dois feixes. */
export function IconeFarol({ tamanho = 48, estado = 'aceso' }: Omit<PropsIcone, 'cor'> & { estado?: EstadoDoFarol }) {
  const lampada = estado === 'apagado' ? cor.linha : cor.luz;
  return (
    <Svg width={tamanho * 1.5} height={tamanho} viewBox="-12 0 72 48">
      {estado === 'aceso' ? (
        <G opacity={0.4}>
          <Polygon points="24,11.5 60,4 60,19" fill={cor.luz} />
          <Polygon points="24,11.5 -12,4 -12,19" fill={cor.luz} />
        </G>
      ) : null}
      <G opacity={estado === 'apagado' ? 0.6 : 1}>
        <Path d="M16 8.5 L24 2.5 L32 8.5 Z" fill={cor.texto} />
        <Rect x={18} y={8} width={12} height={8} rx={2} fill={lampada} />
        <Rect x={15.5} y={16} width={17} height={3} rx={1.5} fill={cor.texto} />
        <Path d="M18.5 19 L29.5 19 L32.5 44 L15.5 44 Z" fill={cor.texto} />
        <Path d="M17.6 26.5 L30.4 26.5 L31.1 32 L16.9 32 Z" fill={cor.mare} />
        <Rect x={21.8} y={36.5} width={4.4} height={7.5} rx={2.2} fill={cor.mare} />
        <Rect x={11} y={44} width={26} height={3.2} rx={1.6} fill={cor.texto} />
      </G>
    </Svg>
  );
}

/**
 * A luz da sequência de dias: um núcleo com raios, em vez de uma chama.
 * `intensidade` de 0 a 1: com 0, a luz abaixa, mas não apaga (sem punição).
 */
export function IconeLuzDaSequencia({
  tamanho = 24,
  intensidade = 1,
}: Omit<PropsIcone, 'cor'> & { intensidade?: number }) {
  const raios = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    const x1 = 12 + 7.2 * Math.cos(a);
    const y1 = 12 + 7.2 * Math.sin(a);
    const x2 = 12 + 10 * Math.cos(a);
    const y2 = 12 + 10 * Math.sin(a);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }).join(' ');
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d={raios} stroke={cor.luz} strokeWidth={2} strokeLinecap="round" opacity={intensidade} />
      <Circle cx={12} cy={12} r={5} fill={cor.luz} opacity={0.45 + 0.55 * intensidade} />
    </Svg>
  );
}

/** Faísca de luz: XP e acertos seguidos. */
export function IconeFaisca({ tamanho = 24, cor: c = cor.luz }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M11 3 C11.7 8.6 14.4 11.3 20 12 C14.4 12.7 11.7 15.4 11 21 C10.3 15.4 7.6 12.7 2 12 C7.6 11.3 10.3 8.6 11 3 Z"
        fill={c}
      />
      <Path
        d="M19 2.5 C19.3 4.4 19.9 5 21.8 5.3 C19.9 5.6 19.3 6.2 19 8.1 C18.7 6.2 18.1 5.6 16.2 5.3 C18.1 5 18.7 4.4 19 2.5 Z"
        fill={c}
        opacity={0.7}
      />
    </Svg>
  );
}

/** Anel da meta do dia: a luz percorre o anel até fechar. `progresso` de 0 a 1. */
export function IconeAnelDaMeta({ tamanho = 24, progresso = 0 }: Omit<PropsIcone, 'cor'> & { progresso?: number }) {
  const p = Math.min(Math.max(progresso, 0), 1);
  // Arco desenhado a partir do topo, no sentido horário (sem rotação, que o navegador trata diferente).
  const angulo = 2 * Math.PI * p;
  const x = 12 + 8.5 * Math.sin(angulo);
  const y = 12 - 8.5 * Math.cos(angulo);
  const arco = `M12 3.5 A8.5 8.5 0 ${angulo > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={p >= 1 ? cor.luz : cor.linha} strokeWidth={3} fill="none" />
      {p > 0 && p < 1 ? <Path d={arco} stroke={cor.luz} strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
      {p >= 1 ? <Circle cx={12} cy={12} r={3.6} fill={cor.luz} /> : null}
    </Svg>
  );
}

/** Estrela de luz de 8 pontas: parte dominada pelo desafio. */
export function IconeEstrelaDeLuz({ tamanho = 24, cor: c = cor.fundo }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Polygon points={pontosDeEstrela(12, 12, 8, 10, 5.2)} fill={c} />
    </Svg>
  );
}

/** Começar: um triângulo de cantos suaves, como a ponta de um feixe. */
export function IconeComecar({ tamanho = 24, cor: c = cor.textoSobreLuz }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M8.5 6 L18 12 L8.5 18 Z" fill={c} stroke={c} strokeWidth={2.6} strokeLinejoin="round" />
    </Svg>
  );
}

/** Selo de lição concluída. */
export function IconeSeloConcluida({ tamanho = 48 }: Omit<PropsIcone, 'cor'>) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={19} fill={cor.acerto} />
      <Circle cx={24} cy={24} r={15} fill="none" stroke={cor.fundo} strokeWidth={1.5} opacity={0.35} />
      <Path
        d="M15.5 24.5 L21.5 30 L33 17.5"
        stroke={cor.fundo}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Polygon points={pontosDeEstrela(39, 9, 4, 5, 1.6)} fill={cor.luz} />
    </Svg>
  );
}

/** Selo de parte dominada: o selo com borda de raios, como uma luz carimbada. */
export function IconeSeloDominada({ tamanho = 48 }: Omit<PropsIcone, 'cor'>) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 48 48">
      <Polygon points={pontosDeEstrela(24, 24, 16, 22, 18)} fill={cor.luz} />
      <Circle cx={24} cy={24} r={14} fill="none" stroke={cor.fundo} strokeWidth={1.5} opacity={0.35} />
      <Polygon points={pontosDeEstrela(24, 24, 8, 9.5, 4.8)} fill={cor.fundo} />
    </Svg>
  );
}

/** Desafio "Pular pra cá?": uma bússola, com o norte em luz. */
export function IconeBussola({ tamanho = 24, cor: c = cor.texto }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9.5} stroke={c} strokeWidth={2} fill="none" />
      <Polygon points="12,4.8 14.6,12 9.4,12" fill={cor.luz} />
      <Polygon points="12,19.2 14.6,12 9.4,12" fill={c} opacity={0.55} />
      <Circle cx={12} cy={12} r={1.4} fill={c} />
    </Svg>
  );
}

/** Revisão: a luz que volta. */
export function IconeRevisao({ tamanho = 24, cor: c = cor.texto }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M5.2 9 A7.5 7.5 0 1 1 4.6 13.5 M4.5 4.5 V9.2 H9.2"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={12} cy={12} r={2.6} fill={cor.luz} />
    </Svg>
  );
}

/** Lição relâmpago: um feixe rápido que atravessa. */
export function IconeRelampago({ tamanho = 24, cor: c = cor.texto }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Polygon points="6,12 22,6.5 22,17.5" fill={cor.luz} opacity={0.85} />
      <Circle cx={6} cy={12} r={2.4} fill={cor.luz} />
      <Path d="M2 7.5 H7 M2 16.5 H6" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
