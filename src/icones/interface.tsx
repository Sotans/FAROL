import type { LucideIcon } from 'lucide-react-native';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Bell from 'lucide-react-native/icons/bell';
import BookOpen from 'lucide-react-native/icons/book-open';
import ChartColumn from 'lucide-react-native/icons/chart-column';
import Check from 'lucide-react-native/icons/check';
import Download from 'lucide-react-native/icons/download';
import Flag from 'lucide-react-native/icons/flag';
import FlaskConical from 'lucide-react-native/icons/flask-conical';
import House from 'lucide-react-native/icons/house';
import Info from 'lucide-react-native/icons/info';
import LockKeyhole from 'lucide-react-native/icons/lock-keyhole';
import Mail from 'lucide-react-native/icons/mail';
import Route from 'lucide-react-native/icons/route';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import UserRound from 'lucide-react-native/icons/user-round';
import Volume2 from 'lucide-react-native/icons/volume-2';
import VolumeX from 'lucide-react-native/icons/volume-x';
import WifiOff from 'lucide-react-native/icons/wifi-off';
import X from 'lucide-react-native/icons/x';

import { cor } from '@/tema/tokens';
import type { PropsIcone } from './tipos';

/**
 * Ícones de interface do FAROL, da biblioteca Lucide (licença ISC, uso comercial livre).
 * Seguem a gramática do conjunto (análise de 2026-11-25): grade de 24, traço único de 2,4 com
 * pontas arredondadas, cor dos tokens e nenhum ponto de luz. O âmbar fica nos ícones de marca e
 * conquista (farol, luz, lanterna, faísca), que continuam desenhados à mão em conquistas.tsx.
 *
 * Cada ícone é importado do próprio arquivo (`lucide-react-native/icons/<nome>`): importar da raiz
 * do pacote levaria os mais de mil ícones da biblioteca para dentro do app.
 */
export const TRACO_DA_INTERFACE = 2.4;

function criar(Icone: LucideIcon, corPadrao: string, nome: string) {
  function IconeDaInterface({ tamanho = 24, cor: c = corPadrao }: PropsIcone) {
    return <Icone size={tamanho} color={c} strokeWidth={TRACO_DA_INTERFACE} />;
  }
  IconeDaInterface.displayName = nome;
  return IconeDaInterface;
}

// Utilitários (substituem os desenhos anteriores, com os mesmos nomes e cores padrão).
export const IconeFechar = criar(X, cor.textoSuave, 'IconeFechar');
export const IconeVisto = criar(Check, cor.acerto, 'IconeVisto');
export const IconeSeta = criar(ArrowRight, cor.acerto, 'IconeSeta');
/** Cadeado com fechadura em traço: sem ponto de luz, para os nós bloqueados não acenderem a trilha. */
export const IconeCadeado = criar(LockKeyhole, cor.textoSuave, 'IconeCadeado');
/** Guardar o progresso (cadastro). Em maré: é informação, não conquista. */
export const IconeEscudo = criar(ShieldCheck, cor.mareClaro, 'IconeEscudo');

// Navegação e telas do MVP (docs/06): abas, perfil, offline, lembrete, qualidade do conteúdo.
export const IconeInicio = criar(House, cor.texto, 'IconeInicio');
export const IconeTrilha = criar(Route, cor.texto, 'IconeTrilha');
export const IconePerfil = criar(UserRound, cor.texto, 'IconePerfil');
export const IconeMaterias = criar(BookOpen, cor.texto, 'IconeMaterias');
export const IconeEstatisticas = criar(ChartColumn, cor.texto, 'IconeEstatisticas');
export const IconeBaixar = criar(Download, cor.texto, 'IconeBaixar');
export const IconeSemConexao = criar(WifiOff, cor.textoSuave, 'IconeSemConexao');
export const IconeLembrete = criar(Bell, cor.texto, 'IconeLembrete');
export const IconeEmail = criar(Mail, cor.texto, 'IconeEmail');
export const IconeReportar = criar(Flag, cor.texto, 'IconeReportar');
export const IconeEmValidacao = criar(Info, cor.texto, 'IconeEmValidacao');
export const IconeSom = criar(Volume2, cor.texto, 'IconeSom');
export const IconeSemSom = criar(VolumeX, cor.textoSuave, 'IconeSemSom');
export const IconeLaboratorio = criar(FlaskConical, cor.texto, 'IconeLaboratorio');
