<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ゲスト画面</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>ゲスト画面</h1>
    <p>参加コード: <strong id="room-pin"></strong></p>
    <p>ホストの名前: <strong id="host-user-name">未設定</strong></p>
    <p>ゲストの名前: <strong id="guest-user-name">未設定</strong></p>
    
    <script src="{{ asset('js/guest2.js') }}"></script>
    @vite('resources/js/guest2.js')
</body>
</html>