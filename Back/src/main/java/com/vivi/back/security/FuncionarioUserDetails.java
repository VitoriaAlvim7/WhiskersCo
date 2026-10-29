package com.vivi.back.security;

import com.vivi.back.model.Funcionario;
import com.vivi.back.model.enums.StatusFuncionario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class FuncionarioUserDetails implements UserDetails {

    private final Funcionario funcionario;

    public FuncionarioUserDetails(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + funcionario.getFuncao().name()));
    }

    @Override
    public String getPassword() {
        return funcionario.getSenha();
    }

    @Override
    public String getUsername() {
        return funcionario.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return podeAcessar(funcionario);
    }

    public static boolean podeAcessar(Funcionario funcionario) {
        return Boolean.TRUE.equals(funcionario.getAtivo())
                && funcionario.getStatusFuncionario() == StatusFuncionario.ATIVO;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }
}
