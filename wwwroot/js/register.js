document.addEventListener('DOMContentLoaded', function () {
    const password = document.getElementById('password');
    const confirmWrapper = document.getElementById('confirmPasswordWrapper');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorText = document.getElementById('passwordError');
    const form = document.querySelector('form');
    const togglePassword = document.getElementById('togglePassword');

    if (!password || !confirmWrapper || !confirmPassword || !errorText || !form) {
        console.error("Form elemanları bulunamadı!");
        return;
    }

    // Şifre yazıldıkça ikinci kutuyu göster
    password.addEventListener('input', function () {
        if (password.value.trim().length > 0) {
            confirmWrapper.classList.add('active');
        } else {
            confirmWrapper.classList.remove('active');
        }
    });

    // Form gönderiminde şifre eşleşmesini kontrol et
    form.addEventListener('submit', function (e) {
        if (password.value !== confirmPassword.value) {
            e.preventDefault();
            errorText.style.display = 'block';
        } else {
            errorText.style.display = 'none';
        }
    });

    // Göz simgesi basılı tutulunca şifre görünür
    if (togglePassword) {
        togglePassword.addEventListener('mousedown', function () {
            password.type = 'text';
        });

        togglePassword.addEventListener('mouseup', function () {
            password.type = 'password';
        });

        togglePassword.addEventListener('mouseleave', function () {
            password.type = 'password';
        });
    }
});
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('mousedown', function () {
        confirmPassword.type = 'text';
    });

    toggleConfirmPassword.addEventListener('mouseup', function () {
        confirmPassword.type = 'password';
    });

    toggleConfirmPassword.addEventListener('mouseleave', function () {
        confirmPassword.type = 'password';
    });
}
