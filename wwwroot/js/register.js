<script>
    document.querySelector('a[href="/Kayit"]').addEventListener('click', function (e) {
        e.preventDefault(); // Sayfa yönlenmesin
    document.querySelector('.container').style.display = 'none'; // Ana içerik gizlenir
    document.getElementById('register-section').classList.remove('hidden'); // Kayıt formu gösterilir
    });
</script>
