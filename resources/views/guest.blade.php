<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>部屋に参加</title>
</head>
<body>
    <h1>部屋に参加する</h1>

    @if(session('error'))
        <p style="color: red;">{{ session('error') }}</p>
    @endif

    <form action="{{ route('rooms.join') }}" method="POST">
        @csrf
        <label for="pin">4桁の参加コードを入力してください</label>
        <input type="text" name="pin" id="pin" maxlength="4" required>
        <button type="submit">参加する</button>
    </form>

    <script src="{{ asset('js/guest.js') }}"></script>
    @vite('resources/js/guest.js')
</body>
</html>
