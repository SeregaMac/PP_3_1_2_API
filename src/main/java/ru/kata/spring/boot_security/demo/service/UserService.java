package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Set;

public interface UserService {
    UserDetails loadUserByUsername(String username);

    User findUserById(Long userId);

    List<User> getAllUsers();

    void saveUser(User user);

    boolean updateUser(User user);

    boolean deleteUser(Long userId);

    Set<Role> getListRoles();

    User findByUsername(String username);

    User getUserByUsername(String name);

}
