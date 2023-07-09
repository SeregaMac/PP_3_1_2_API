let URL = "http://localhost:8080/admin/users";
const roleUrl = 'http://localhost:8080/admin/roles';
const authUserUrl = 'http://localhost:8080/currentUser'

$(document).ready(function () {
    $.ajax({
        url: authUserUrl,
        type: 'GET',
        success: function (user) {
            $('.username').text(user.name);
            let roles = user.roles.map(function (role) {
                return role.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
            });
            $('.role').text(roles.join(' '));
        },
        error: function () {
            console.log('Error getting current user');
        }
    });
});

$(document).ready(function () {
    $.ajax({
        url: authUserUrl,
        type: 'GET',
        success: function (user) {
            $('.id').text(user.id);
            $('.name').text(user.name);
            $('.surname').text(user.surname);
            $('.age').text(user.age);
            let roles = user.roles.map(function (role) {
                return role.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER';
            });
            $('.roles').text(roles.join(', '));
        },
        error: function () {
            console.log('Error getting current user');
        }
    });
});

$(document).ready(function () {
    $.ajax({
        url: authUserUrl,
        type: 'GET',
        success: function (user) {
            let isAdmin = user.roles.some(function (role) {
                return role.name === 'ROLE_ADMIN';
            });
            console.log(isAdmin); // отладочный вывод
            if (isAdmin) {
                $('#adminMenuItem').show();
            } else {
                $('#adminMenuItem').hide();
            }
        },
        error: function () {
            console.log('Error getting current user');
        }
    });
});


// получаем роли с сервера
const selectRoleForm = $('#roles');

$.get(roleUrl, function (data) {
    let options = '';
    $.each(data, function (key, value) {
        options += `<option value="${Number(key) + 1}">${value.name}</option>`;
    });
    selectRoleForm.html(options);
});

// получаем пользователей с сервера
let userTable = $("#tableAllUsers");
let outputUser = [];

const renderTable = (users) => {
    outputUser = []; // Очистка массива перед обновлением таблицы
    users.forEach(user => {
        let roleLet = "";
        user.roles.forEach((role) => {
            // Удаляем префикс "ROLE_" из имени роли
            let roleName = role.name.replace("ROLE_", "");
            roleLet += roleName + "    ";
        });

        outputUser.push({ // Добавляем объект пользователя в массив
            id: user.id,
            name: user.name,
            surname: user.surname,
            age: user.age,
            username: user.username,
            password: user.password,

            roles: roleLet.slice(0, roleLet.length - 3),


        });
    });

    let tableContent = ''; // Создаем пустую строку
    outputUser.forEach(user => {
        tableContent += `
            <tr>
                <td><span>${user.id}</span></td>
                <td><span>${user.name}</span></td>
                <td><span>${user.surname}</span></td>
                <td><span>${user.age}</span></td>
                <td><span>${user.username}</span></td>
                
                <td><span>${user.roles}</span></td>
                <th>
                    <button data-id="${user.id}" type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#editModal" id="editbtn">Edit</button>
                </th>
                <th>
                    <button data-id="${user.id}" type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" id="delbtn">Delete</button>
                </th>
            </tr>
        `;
    });

    userTable.html(tableContent); // Устанавливаем строку с содержимым таблицы
};

$.get(URL, function (data) {
    renderTable(data);
});


// Заполнение форм Edit и Delete
userTable.on('click', '#editbtn', function () {
    let userId = $(this).data('id');
    $.get(`${URL}/${userId}`, function (data) {
        $("#idEdit").val(data.id);
        $("#nameEdit").val(data.name);
        $("#surnameEdit").val(data.surname);
        $("#ageEdit").val(data.age);
        $("#usernameEdit").val(data.username);
        $("#passwordEdit").val(data.password);

        $.get(roleUrl, function (rolesData) {
            let options = '';
            $.each(rolesData, function (id, name) {
                const selected = data.roles.some(role => role.id === Number(id)) ? 'selected' : '';
                options += `<option value="${Number(id)}" ${selected}>${name.name}</option>`;
            });

            $('#rolesEdit').html(options);
            $('#editModal').modal();
        });
    });
});

userTable.on('click', '#delbtn', function () {
    let userId = $(this).data('id');
    $.get(`${URL}/${userId}`, function (data) {
        let roles = '';
        data.roles.forEach(role => roles += role.name + " ");
        $("#idDelete").val(data.id);
        $("#nameDelete").val(data.name);
        $("#surnameDelete").val(data.surname);
        $("#ageDelete").val(data.age);
        $("#usernameDelete").val(data.username);
        $("#passwordDel").val(data.password);
        $("#rolesDelete").val(roles);
    });
});


// Изменение юзера
let modalFormEdit = $('#editModalForm');
let roleEdit = $('#rolesEdit');

modalFormEdit.submit(function (e) {
    e.preventDefault();

    $('#nameEditError').text('');
    $('#surnameEditError').text('');
    $('#ageEditError').text('');
    $('#usernameEditError').text('Вы ввели неправильный логин');
    $('#passwordEditError').text('');

    const rol = [];
    $('#rolesEdit option:selected').each(function () {
        rol.push({
            id: $(this).val(),
            name: $(this).text()
        });
    });

    const user = {
        id: $("#idEdit").val(),
        name: $("#nameEdit").val(),
        surname: $("#surnameEdit").val(),
        age: $("#ageEdit").val(),
        username: $("#usernameEdit").val(),
        password: $("#passwordEdit").val(),
        roles: rol
    };

    $.ajax({
        url: `${URL}`,
        type: 'PATCH',
        data: JSON.stringify(user),
        contentType: 'application/json',
        success: function () {
            $('#editModal').modal('hide');
            outputUser = '';
            $.get(URL, function (data) {
                renderTable(data);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // обработка ошибки
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                const errors = jqXHR.responseJSON.message.split(';');
                errors.forEach(error => {
                    const [field, message] = error.split(' - ');
                    $(`#${field}EditError`).text(message); // обновляем текст ошибки
                });
            }
        }
    });
});


// Удаление юзера
let modalFormDelete = $('#deleteModalForm');

modalFormDelete.submit(function (e) {
    e.preventDefault();
    let userId = $("#idDelete").val();

    $.ajax({
        url: `${URL}/${userId}`,
        type: 'DELETE',
        success: function () {
            $('#deleteModal').modal('hide');
            outputUser = '';
            $.get(URL, function (data) {
                renderTable(data);
            });
        }
    });
});


// Добавление юзера

let userFormNew = $("#newUserForm");

userFormNew.submit(function (e) {
    e.preventDefault();

    $('#nameError').text('');
    $('#surnameError').text('');
    $('#ageError').text('');
    $('#usernameError').text('Вы ввели неправильный логин');
    $('#passwordError').text('');

    const roles = [];
    $('#roles option:selected').each(function () {
        roles.push({
            id: $(this).val(),
            name: $(this).text()
        });
    });

    const user = {
        name: $(".name_input").val(),
        surname: $(".surname_input").val(),
        age: $(".age_input").val(),
        username: $(".username_input").val(),
        password: $(".password_input").val(),
        roles: roles
    };

    $.ajax({
        url: URL,
        type: 'POST',
        data: JSON.stringify(user),
        contentType: 'application/json',
        success: function (data) {
            $('#listUsers-tab').tab('show');
            userFormNew[0].reset();
            $.get(URL, function (data) {
                renderTable(data);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // обработка ошибки
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                const errors = jqXHR.responseJSON.message.split(';');
                errors.forEach(error => {
                    const [field, message] = error.split(' - ');
                    $(`#${field}Error`).text(message); // обновляем текст ошибки
                });
            }
        }
    });
});

