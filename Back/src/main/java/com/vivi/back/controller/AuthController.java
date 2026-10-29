package com.vivi.back.controller;

import com.vivi.back.dto.LoginResponse;
import com.vivi.back.form.CadastroForm;
import com.vivi.back.form.LoginForm;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.security.FuncionarioUserDetails;
import com.vivi.back.security.TokenJwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenJwtService tokenJwtService;

    @GetMapping("/csrf")
    public ResponseEntity<?> csrf() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> autenticar(@RequestBody LoginForm loginForm) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByEmail(loginForm.email());

        if (funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", "Usuário ou senha inválidos"));
        }

        Funcionario funcionario = funcionarioOpt.get();

        if (!passwordEncoder.matches(loginForm.senha(), funcionario.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", "Usuário ou senha inválidos"));
        }

        if (!FuncionarioUserDetails.podeAcessar(funcionario)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Este usuário está desativado. Procure o gerente da clínica."));
        }

        return respostaComCookie(funcionario, HttpStatus.OK);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroForm cadastroForm) {
        if (funcionarioRepository.findByEmail(cadastroForm.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "Este e-mail já está cadastrado"));
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(cadastroForm.nome());
        funcionario.setEmail(cadastroForm.email());
        funcionario.setSenha(passwordEncoder.encode(cadastroForm.senha()));
        funcionario.setFuncao(FuncaoFuncionario.RECEPCIONISTA);
        funcionario.setStatusFuncionario(StatusFuncionario.ATIVO);
        funcionario.setAtivo(true);

        funcionario = funcionarioRepository.save(funcionario);

        return respostaComCookie(funcionario, HttpStatus.CREATED);
    }

    // Quem está logado, lido do token: o front usa isto em vez do id guardado no
    // navegador, que fica errado se o banco por trás da API mudar (ex.: modo demo).
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> usuarioAtual(@AuthenticationPrincipal FuncionarioUserDetails usuario) {
        Funcionario funcionario = usuario.getFuncionario();
        return ResponseEntity.ok(new LoginResponse(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getEmail(),
                funcionario.getFuncao().toString()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, tokenJwtService.criarCookieExpirado().toString())
                .build();
    }

    private ResponseEntity<?> respostaComCookie(Funcionario funcionario, HttpStatus status) {
        String token = tokenJwtService.gerarToken(funcionario);
        LoginResponse resposta = new LoginResponse(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getEmail(),
                funcionario.getFuncao().toString()
        );
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, tokenJwtService.criarCookie(token).toString())
                .body(resposta);
    }
}
