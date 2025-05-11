document.addEventListener('DOMContentLoaded', function () {
    const password = document.getElementById('loginPassword');
    const toggle = document.getElementById('toggleLoginPassword');

    if (toggle && password) {
        toggle.addEventListener('mousedown', function () {
            password.type = 'text';
        });

        toggle.addEventListener('mouseup', function () {
            password.type = 'password';
        });

        toggle.addEventListener('mouseleave', function () {
            password.type = 'password';
        });
    }
});
