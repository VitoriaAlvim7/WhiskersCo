import { Component } from '@angular/core';

interface Pergunta { pergunta: string; resposta: string; aberta: boolean; }

@Component({
  selector: 'app-ajuda',
  templateUrl: './ajuda.component.html',
  styleUrls: ['./ajuda.component.scss']
})
export class AjudaComponent {
  perguntas: Pergunta[] = [
    { aberta: false, pergunta: 'Como cadastro um novo paciente?',
      resposta: 'Vá em "Pacientes" → "+ Novo Paciente". Se o tutor ainda não existir na base, use o link "Cadastrar novo tutor" dentro do próprio formulário.' },
    { aberta: false, pergunta: 'Como agendo uma consulta?',
      resposta: 'Vá em "Agenda" ou use o botão "+ Nova Consulta" no Dashboard, escolha o paciente, o veterinário, a data/hora e o motivo.' },
    { aberta: false, pergunta: 'Como emito um receituário?',
      resposta: 'Vá em "Receituários" → "+ Novo Receituário", escolha a consulta correspondente e escreva a prescrição. Depois é possível baixar em PDF pela lista.' },
    { aberta: false, pergunta: 'Como registro uma venda ou pagamento?',
      resposta: 'Vá em "Caixa" → "+ Nova Transação". Você pode vincular a uma consulta (opcional) e/ou adicionar produtos vendidos do estoque.' },
    { aberta: false, pergunta: 'Como funciona a adoção?',
      resposta: 'Cadastre o animal em "Adoção". Quando um tutor quiser adotar, clique em "Adotar" no card do animal e escolha o tutor — o animal se torna paciente da clínica automaticamente.' },
    { aberta: false, pergunta: 'Esqueci minha senha, e agora?',
      resposta: 'Ainda não existe recuperação de senha automática. Peça para um gerente redefinir seu cadastro em "Funcionários", ou fale com o administrador do sistema.' },
  ];

  toggle(p: Pergunta): void {
    p.aberta = !p.aberta;
  }
}
