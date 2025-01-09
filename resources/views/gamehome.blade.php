<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>魔法少女と大富豪</title>
    <link rel="stylesheet" href="{{ asset('css/gemehome.css') }}">
    @vite('resources/css/gemehome.css')
</head>
<body>
    <header>
        <h1>魔法少女と大富豪</h1>
        <div class="header-buttons">
            @if(Auth::check())
                <!-- ログイン済みの場合：ユーザー名とログアウトボタンを表示 -->
                <span class="user-name">{{ Auth::user()->name }}</span>
                <form method="POST" action="{{ route('logout') }}" style="display:inline;">
                    @csrf
                    <button type="submit" class="header-button">ログアウト</button>
                </form>
            @else
                <!-- 未ログインの場合：アカウントボタンを表示 -->
                <button class="header-button" onclick="openAccountModal()">アカウント</button>
            @endif
        </div>
    </header>
    <main>
        <button class="main-button" onclick="openSinglePractice()">一人で練習</button><br><br>
        <button class="main-button" onclick="openMultiplePractice()">友達と対戦</button><br><br>
        <button class="main-button" onclick="">ルールを覚える</button><br><br>
        <button class="main-button" onclick="openRulesSettings()">ルール設定</button>
    </main>

    <!-- アカウントモーダルウィンドウ (未ログイン時のみ使用) -->
    @if(!Auth::check())
    <div id="accountModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAccountModal()">&times;</span>
            <h2>アカウント情報</h2>
            <div id="account-page" class="account-page-container">
                <div class="account-buttons">
                    <button onclick="openLoginPage()">ログイン</button>
                    <button onclick="openRegisterPage()">登録</button>
                </div>
            </div>
        </div>
    </div>
    @endif

    @if(Auth::check())
    <!-- 友達と対戦モーダルウィンドウ -->
    <div id="multiplayerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeMultiplePractice()">&times;</span>
            <h2>マルチプレイ</h2>
            <div class="multiplayer-buttons">
                <button onclick="createRoom()">部屋を立てる</button>
                <button onclick="joinRoom()">部屋に参加する</button>
            </div>
        </div>
    </div>
    @endif

    <!-- ルール設定モーダルウィンドウ -->
    <div id="rulesModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeRulesSettings()">&times;</span>
            <h2>ルール設定</h2>
            
            @include('setting4') <!-- setting4.blade.phpを読み込む -->
        </div>
    </div>

    <script src="{{ asset('js/gemehome.js') }}"></script>
    @vite('resources/js/gemehome.js')
</body>
</html>

