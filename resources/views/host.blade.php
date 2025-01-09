<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ホスト画面</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body onload="init()">
    <h1>ホスト画面</h1>
    <p>参加コード: <strong>{{ Auth::user()->pin }}</strong></p>
    <p>参加メンバー : <strong id="guestNAME">いません</strong></p>

    <!-- ① Blade でルートをJS変数に埋め込む -->
    <script>
        const CREATE_ROOM_URL  = "{{ route('rooms.create') }}";
        const CHECK_GUEST_URL = "{{ route('rooms.checkGuest') }}";
    </script>

    <!-- ② 外部JSファイルを読み込む -->
    <script src="{{ asset('js/host.js') }}"></script>
    @vite('resources/js/host.js')
</body>
</html>
