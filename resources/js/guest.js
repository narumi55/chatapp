document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('join-room-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // デフォルトのフォーム送信を防止

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                'Accept': 'application/json',
            },
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(error => Promise.reject(error));
        })
        .then(data => {
            if (data.redirect) {
                // リダイレクト先の URL に移動
                window.location.href = data.redirect;
            } else if (data.error) {
                // エラーメッセージを表示
                const errorElement = document.querySelector('p[style="color: red;"]');
                if (errorElement) {
                    errorElement.textContent = data.error;
                }
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            // 必要に応じてユーザーにエラーメッセージを表示
            const errorElement = document.querySelector('p[style="color: red;"]');
            if (errorElement && error.error) {
                errorElement.textContent = error.error;
            } else {
                errorElement.textContent = '予期せぬエラーが発生しました。';
            }
        });
    });
});