package ru.kata.spring.boot_security.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.kata.spring.boot_security.demo.service.UserService;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    private final SuccessUserHandler successUserHandler;
    private final UserService userService;

    @Autowired
    public WebSecurityConfig(SuccessUserHandler successUserHandler, UserService userService) {
        this.successUserHandler = successUserHandler;
        this.userService = userService;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {  //все настройки безопасности, доступа
        http.csrf().disable()
                .authorizeRequests()// начинает настройку правил авторизации запросов.
                .antMatchers("/", "/index").permitAll()//разрешает доступ ко всем запросам, обращающимся к корневому пути или /index без авторизации.
                .antMatchers("/admin/**").hasAnyRole("ADMIN")//ограничивает доступ к запросам, начинающимся с /admin/, только пользователям с ролью "ADMIN".
                .antMatchers("/user/**").hasAnyRole("USER", "ADMIN")//ограничивает доступ к запросу /user пользователям, которые имеют роль "ADMIN" или "USER".
                .anyRequest().authenticated()//требует авторизации для любого другого запроса.
                .and()//для создания цепочки настроек, несколько условий безопасности
                .formLogin()////стандартная форма спринг для аунтефикации
                .successHandler(successUserHandler)// настройки действий, после успешной аутентификации пользователя,
                // например, перенаправление на определенную страницу или выполнение каких-то других действий
                .permitAll()//что любой пользователь, имеет доступ к этому URL-адресу или ресурсу без учетных данные
                .and()
                .logout().logoutSuccessUrl("/login")//для выхода пользователя из системы
                .permitAll();
    }

    @Bean
    public PasswordEncoder PasswordEncoder() { //шифрование
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder());
        daoAuthenticationProvider.setUserDetailsService(userService);
        return daoAuthenticationProvider;
    }
}