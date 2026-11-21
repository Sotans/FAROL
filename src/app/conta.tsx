import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { Botao } from '@/componentes/Botao';
import { Personagem } from '@/componentes/Personagem';
import {
  codigoCompleto,
  emailValido,
  explicarErro,
  normalizarCodigo,
  normalizarEmail,
  type Saida,
} from '@/conta/regras';
import { useProgresso } from '@/estado/progresso';
import { IconeFechar } from '@/icones';
import { haptico } from '@/servicos/haptico';
import {
  confirmarCodigoParaEntrar,
  confirmarCodigoParaSalvar,
  nuvemConfigurada,
  pedirCodigoParaEntrar,
  pedirCodigoParaSalvar,
} from '@/servicos/nuvem';
import { tocar } from '@/servicos/som';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

type Fluxo = 'salvar' | 'entrar';
type Etapa = 'email' | 'codigo' | 'pronto';

const textos: Record<Fluxo, { titulo: string; sub: string; pronto: string; prontoSub: string }> = {
  salvar: {
    titulo: 'Guarde seu progresso',
    sub: 'Hoje ele está só neste aparelho. Com seu e-mail, você não perde a trilha se trocar de celular. Sem senha: a gente manda um código.',
    pronto: 'Progresso guardado!',
    prontoSub: 'Sua trilha agora está segura na sua conta.',
  },
  entrar: {
    titulo: 'Entrar na sua conta',
    sub: 'Digite o e-mail que você usou no FAROL. Vamos mandar um código para ele.',
    pronto: 'Que bom te ver de volta!',
    prontoSub: 'Sua trilha foi trazida para este aparelho.',
  },
};

/** Conta (submeta 2.6): salvar o progresso com um e-mail, ou entrar numa conta existente. Login por código, sem senha. */
export default function ContaTela() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const { conta, carreira, aposEntrarNaConta, aposSalvarAConta, sairDaConta } = useProgresso();
  const [fluxo, setFluxo] = useState<Fluxo>(modo === 'entrar' ? 'entrar' : 'salvar');
  const [etapa, setEtapa] = useState<Etapa>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<{ mensagem: string; saida: Saida } | null>(null);
  const c = carreiraPorId(carreira);
  const t = textos[fluxo];
  const contaPermanente = conta && !conta.anonima;

  async function pedirCodigo(qualFluxo: Fluxo = fluxo) {
    const endereco = normalizarEmail(email);
    if (!emailValido(endereco)) {
      setErro({ mensagem: 'Confira o e-mail: parece que falta alguma parte.', saida: 'tentarDeNovo' });
      haptico.aviso();
      return;
    }
    setOcupado(true);
    setErro(null);
    try {
      if (qualFluxo === 'salvar') await pedirCodigoParaSalvar(endereco);
      else await pedirCodigoParaEntrar(endereco);
      setEtapa('codigo');
      haptico.leve();
      tocar('popup');
    } catch (e) {
      setErro(explicarErro(e));
      haptico.aviso();
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar() {
    setOcupado(true);
    setErro(null);
    const endereco = normalizarEmail(email);
    const token = normalizarCodigo(codigo);
    try {
      if (fluxo === 'salvar') {
        await confirmarCodigoParaSalvar(endereco, token);
        await aposSalvarAConta();
      } else {
        await confirmarCodigoParaEntrar(endereco, token);
        await aposEntrarNaConta();
      }
      setEtapa('pronto');
      haptico.sucesso();
      tocar('licao');
    } catch (e) {
      setErro(explicarErro(e));
      haptico.aviso();
    } finally {
      setOcupado(false);
    }
  }

  function seguirASaida(saida: Saida) {
    if (saida === 'entrarNaConta') {
      setFluxo('entrar');
      setCodigo('');
      void pedirCodigo('entrar');
    } else if (saida === 'criarConta') {
      setFluxo('salvar');
      setEtapa('email');
      setErro(null);
    } else if (saida === 'pedirNovoCodigo') {
      setCodigo('');
      void pedirCodigo();
    } else {
      setErro(null);
    }
  }

  function confirmarSaida() {
    const sair = () => {
      void sairDaConta().then(() => router.replace('/'));
    };
    const texto = 'Seu progresso continua guardado na conta. Neste aparelho, o app recomeça.';
    if (Platform.OS === 'web') {
      // Alert.alert não funciona no navegador.
      if (window.confirm(`Sair da conta? ${texto}`)) sair();
      return;
    }
    Alert.alert('Sair da conta?', texto, [
      { text: 'Ficar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  const rotuloDaSaida: Partial<Record<Saida, string>> = {
    entrarNaConta: 'ENTRAR NESSA CONTA',
    criarConta: 'GUARDAR MEU PROGRESSO COM ESSE E-MAIL',
    pedirNovoCodigo: 'MANDAR OUTRO CÓDIGO',
  };

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={estilos.fechar}>
          <IconeFechar tamanho={26} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.corpo} keyboardShouldPersistTaps="handled">
          {!nuvemConfigurada ? (
            <Text style={estilos.sub}>A nuvem está desligada nesta versão do app (falta o arquivo .env.local).</Text>
          ) : contaPermanente && etapa !== 'pronto' ? (
            <>
              <Text style={estilos.titulo}>Sua conta</Text>
              <Text style={estilos.sub}>{`Seu progresso está guardado na conta ${conta.email ?? ''}.`}</Text>
              <View style={estilos.acoes}>
                <Botao rotulo="Sair da conta" variante="terciario" onPress={confirmarSaida} />
              </View>
            </>
          ) : etapa === 'pronto' ? (
            <Animated.View entering={FadeInDown.duration(300)} style={estilos.centro}>
              {c ? <Personagem carreira={c} expressao="comemorando" tamanho={110} /> : null}
              <Text style={[estilos.titulo, estilos.textoCentro]}>{t.pronto}</Text>
              <Text style={[estilos.sub, estilos.textoCentro]}>{t.prontoSub}</Text>
              <View style={estilos.acoes}>
                <Botao rotulo="VOLTAR À TRILHA" onPress={() => router.replace('/')} />
              </View>
            </Animated.View>
          ) : (
            <>
              <Text style={estilos.titulo} accessibilityRole="header">
                {t.titulo}
              </Text>
              <Text style={estilos.sub}>
                {etapa === 'email' ? t.sub : `Digite o código que enviamos para ${normalizarEmail(email)}.`}
              </Text>

              {etapa === 'email' ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={cor.textoSuave}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  onSubmitEditing={() => void pedirCodigo()}
                  editable={!ocupado}
                  accessibilityLabel="E-mail"
                  style={estilos.campo}
                />
              ) : (
                <TextInput
                  value={codigo}
                  onChangeText={setCodigo}
                  placeholder="000000"
                  placeholderTextColor={cor.textoSuave}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={12}
                  returnKeyType="done"
                  onSubmitEditing={() => codigoCompleto(codigo) && void confirmar()}
                  editable={!ocupado}
                  accessibilityLabel="Código recebido por e-mail"
                  style={[estilos.campo, estilos.campoCodigo]}
                />
              )}

              {erro ? (
                <Animated.View entering={FadeInDown.duration(220)} style={estilos.erro}>
                  <Text style={estilos.erroTexto}>{erro.mensagem}</Text>
                  {rotuloDaSaida[erro.saida] ? (
                    <Botao
                      rotulo={rotuloDaSaida[erro.saida] ?? ''}
                      variante="secundario"
                      onPress={() => seguirASaida(erro.saida)}
                    />
                  ) : null}
                </Animated.View>
              ) : null}

              <View style={estilos.acoes}>
                {ocupado ? <ActivityIndicator color={cor.luz} /> : null}
                {etapa === 'email' ? (
                  <Botao
                    rotulo="MANDAR CÓDIGO"
                    desabilitado={ocupado || !email.trim()}
                    onPress={() => void pedirCodigo()}
                  />
                ) : (
                  <>
                    <Botao
                      rotulo="CONFIRMAR"
                      desabilitado={ocupado || !codigoCompleto(codigo)}
                      onPress={() => void confirmar()}
                    />
                    <Botao
                      rotulo="Não chegou? Mandar de novo"
                      variante="terciario"
                      desabilitado={ocupado}
                      onPress={() => void pedirCodigo()}
                    />
                    <Botao
                      rotulo="Usar outro e-mail"
                      variante="terciario"
                      desabilitado={ocupado}
                      onPress={() => {
                        setEtapa('email');
                        setCodigo('');
                        setErro(null);
                      }}
                    />
                  </>
                )}
                {etapa === 'email' && fluxo === 'salvar' && !ocupado ? (
                  <Botao rotulo="Já tenho conta: entrar" variante="terciario" onPress={() => setFluxo('entrar')} />
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  flex: { flex: 1 },
  topo: { paddingHorizontal: 12, paddingTop: 6 },
  fechar: { width: alvoMinimo, height: alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  corpo: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 14 },
  centro: { alignItems: 'center', gap: 10, paddingTop: 24 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.md, lineHeight: 24, color: cor.textoSuave },
  textoCentro: { textAlign: 'center' },
  campo: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cor.linha,
    backgroundColor: cor.superficie,
    color: cor.texto,
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.md + 1,
  },
  campoCodigo: { letterSpacing: 8, textAlign: 'center', fontSize: tamanho.xl },
  erro: {
    gap: 10,
    padding: 14,
    borderRadius: raio.md,
    backgroundColor: cor.superficie,
    borderColor: cor.atencao,
    borderWidth: 1,
  },
  erroTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.texto },
  acoes: { gap: 4, marginTop: 6, width: '100%' },
});
