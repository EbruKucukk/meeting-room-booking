document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('open-register');
    const overlay = document.getElementById('registerOverlay');
    const closeButton = document.getElementById('close-register');

    if (registerButton && overlay) {
        registerButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Formu göster
            overlay.classList.remove('hidden');

            // URL’ye #register ekle ve geçmişe yeni adım ekle
            history.pushState({ formOpen: true }, '', '#register');
        });
    }

    // Kullanıcı “geri” tuşuna basarsa
    window.addEventListener('popstate', function (event) {
        // Eğer kayıt formu açıksa ve geri gidildiyse
        if (!event.state || !event.state.formOpen) {
            overlay.classList.add('hidden');
        }
    });

    // Kapama butonu varsa
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            overlay.classList.add('hidden');
            history.back(); // Tarayıcı geçmişinde bir adım geri git
        });
    }
});
