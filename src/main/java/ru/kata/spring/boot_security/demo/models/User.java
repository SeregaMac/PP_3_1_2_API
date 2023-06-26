package ru.kata.spring.boot_security.demo.models;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
public class User implements UserDetails {  //надо добавить имплемент UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty(message = "Введите имя")
    @Size(min = 3, max = 12, message = "Размер имени от 3 до 12")
    private String name;

    @NotEmpty(message = "Введите фамилию")
    @Size(min = 3, max = 12, message = "Размер фамилии от 3 до 12")
    private String surname;

    @Min(value = 7, message = "Количество лет не должно быть меньше 7")
    private int age;

    @Column(unique = true)
    @Email(message = "Вы ввели не коректный email")
    private String username;


    private String password;

    @ManyToMany
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;

    public User() {
    }

    public User(String name, String surname, int age, String username, String password) {
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.username = username;
        this.password = password;
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { //представляет права доступа пользователя.
        return roles.stream().map(r -> new SimpleGrantedAuthority(r.getName())).collect(Collectors.toList());
    }

    @Override
    public boolean isAccountNonExpired() {  //не истек ли срок действия учетной записи пользователя.
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {  //заблокирована ли учетная запись пользователя.
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {  //истек ли срок действия учетных данных пользователя
        return true;
    }

    @Override
    public boolean isEnabled() { //указывающее, включен ли пользователь в системе.
        return true;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", surname='" + surname + '\'' +
                ", age=" + age +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return id == user.id && age == user.age && Objects.equals(name, user.name) && Objects.equals(surname, user.surname) && Objects.equals(username, user.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, surname, age, username);
    }
}
