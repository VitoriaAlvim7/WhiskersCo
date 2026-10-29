
import { Consulta, Paciente, Receituario } from '../../core/models';

export interface DadosReceita {
  receituario: Receituario;
  consulta: Consulta;
  paciente: Paciente;
  enderecoTutor: string;
}

function escapar(valor: unknown): string {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escaparComQuebras(valor: unknown): string {
  return escapar(valor).replace(/\n/g, '<br>');
}

function dataBr(iso?: string): string {
  return iso?.split('-')?.reverse()?.join('/') ?? '';
}

export function nomeArquivoReceita(dados: DadosReceita): string {
  const nome = (dados.paciente.nome || 'paciente')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const data = dataBr(dados.receituario.dataEmissao).replace(/\//g, '-');
  return `receituario-${nome}-${data}.pdf`;
}

export const LARGURA_RECEITA_PX = 760;

function dataHoraBr(iso?: string): string {
  if (!iso) return '';
  const [data, hora] = iso.split('T');
  return `${dataBr(data)}${hora ? ` às ${hora.substring(0, 5)}` : ''}`;
}

export const ESTILO_RECEITA = `
  * { box-sizing: border-box; }
  .folha {
    width: ${LARGURA_RECEITA_PX}px;
    margin: 0 auto;
    background: #ffffff;
    color: #1f2937;
    font-family: 'Segoe UI', Arial, sans-serif;
    padding: 40px 44px 32px;
  }
  .folha .cabecalho { width: 100%; border-collapse: collapse; }
  .folha .cabecalho td { vertical-align: bottom; padding: 0; }
  .folha .marca { font-size: 25px; font-weight: 700; color: #6d28d9; letter-spacing: -0.3px; }
  .folha .marca-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .folha .doc { text-align: right; }
  .folha .doc-titulo { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #6d28d9; }
  .folha .doc-data { font-size: 12px; color: #6b7280; margin-top: 3px; }
  .folha .regua { height: 3px; background: #6d28d9; margin: 12px 0 22px; }

  .folha .ficha { width: 100%; border-collapse: collapse; background: #f5f3ff;
                  border: 1px solid #ddd6fe; border-radius: 10px; }
  .folha .ficha td { padding: 9px 16px; font-size: 13px; vertical-align: top; width: 50%; }
  .folha .rot { display: block; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
                color: #7c3aed; margin-bottom: 2px; }
  .folha .val { color: #1f2937; }

  .folha .secao { font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
                  color: #6b7280; margin: 26px 0 8px; }
  .folha .corpo { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px;
                  min-height: 250px; font-size: 14px; line-height: 1.9; white-space: pre-wrap; }
  .folha .via { font-size: 11px; color: #6b7280; margin-top: 10px; }

  .folha .assinatura { margin: 46px auto 0; width: 330px; text-align: center;
                       border-top: 1px solid #1f2937; padding-top: 7px; font-size: 12px; }
  .folha .assinatura .nome { font-weight: 600; }
  .folha .assinatura .crmv { color: #6b7280; margin-top: 2px; }

  .folha .rodape { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;
                   text-align: center; font-size: 10.5px; color: #9ca3af; }
`;

export function montarCorpoReceita(dados: DadosReceita): string {
  const { receituario, consulta, paciente, enderecoTutor } = dados;
  const idade = paciente.idade;
  const unidade = (paciente.unidadeIdade || 'ANOS').toLowerCase();
  const veterinario = escapar(consulta.funcionario ?? 'Veterinário(a)');
  const idadeTexto = idade === null || idade === undefined ? '' : ` · ${escapar(idade)} ${escapar(unidade)}`;

  return `
  <div class="folha">
    <table class="cabecalho">
      <tr>
        <td>
          <div class="marca">Whiskers &amp; Co.</div>
          <div class="marca-sub">Clínica Veterinária</div>
        </td>
        <td class="doc">
          <div class="doc-titulo">RECEITUÁRIO</div>
          <div class="doc-data">Emitido em ${escapar(dataBr(receituario.dataEmissao))}</div>
        </td>
      </tr>
    </table>
    <div class="regua"></div>

    <table class="ficha">
      <tr>
        <td><span class="rot">Paciente</span><span class="val">${escapar(paciente.nome)}${idadeTexto}</span></td>
        <td><span class="rot">Tutor</span><span class="val">${escapar(paciente.tutorNome) || '—'}</span></td>
      </tr>
      <tr>
        <td><span class="rot">Raça</span><span class="val">${escapar(paciente.raca) || '—'}</span></td>
        <td><span class="rot">Endereço</span><span class="val">${escapar(enderecoTutor) || '—'}</span></td>
      </tr>
      <tr>
        <td><span class="rot">Veterinário(a)</span><span class="val">${veterinario}</span></td>
        <td><span class="rot">Consulta</span><span class="val">${escapar(dataHoraBr(consulta.dataHora))} · ${escapar(consulta.motivo) || '—'}</span></td>
      </tr>
    </table>

    <div class="secao">Prescrição</div>
    <div class="corpo">${escaparComQuebras(receituario.prescricao)}</div>
    <div class="via">Uso veterinário. 1ª via: retenção da farmácia · 2ª via: orientação do tutor.</div>

    <div class="assinatura">
      <div class="nome">${veterinario}</div>
      <div class="crmv">Médico(a) Veterinário(a) — CRMV ____________</div>
    </div>

    <div class="rodape">Whiskers &amp; Co. — Clínica Veterinária · Documento emitido pelo sistema em ${escapar(dataBr(receituario.dataEmissao))}</div>
  </div>`;
}

export function montarDocumentoReceita(dados: DadosReceita): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Receituário — ${escapar(dados.paciente.nome)}</title>
<style>
  body { margin: 0; padding: 24px; background: #ffffff; }
${ESTILO_RECEITA}
  @media print {
    body { padding: 0; }
    .folha { width: 100%; padding: 0 10px; }
    @page { margin: 14mm; }
  }
</style>
</head>
<body>
${montarCorpoReceita(dados)}
</body>
</html>`;
}
