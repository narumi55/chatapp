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
            <button class="header-button" onclick="openAccountModal()">アカウント</button>
        </div>
    </header>
    <main>
        <button class="main-button" onclick="openSinglePractice()">一人で練習</button><br><br>
        <button class="main-button" onclick="">友達と対戦</button><br><br>
        <button class="main-button" onclick="">ルールを覚える</button><br><br>
        <button class="main-button" onclick="openRulesSettings()">ルール設定</button>
    </main>

    <!-- アカウントモーダルウィンドウ -->
    <div id="accountModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAccountModal()">&times;</span>
            <h2>アカウント情報</h2>
            <div id="account-page" class="account-page-container">
                <div class="account-buttons">
                    <button id="login-btn" class="btn" onclick="openloginModal()">ログイン</button>
                    <button id="register-btn" class="btn" onclick="openregisterModal()">登録</button>
                </div>
            </div>
        </div>
    </div>


    <!-- ログインモーダルウィンドウ -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeloginModal()">&times;</span>
            <h2>ログイン</h2>
            
            @include('auth.login') <!-- auth/login.blade.php を読み込む -->
        </div>
    </div>

    <!-- 登録モーダルウィンドウ -->
    <div id="registerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeregisterModal()">&times;</span>
            <h2>登録</h2>
            
            @include('auth.register') <!-- auth/register.blade.php を読み込む -->
        </div>
    </div>

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

