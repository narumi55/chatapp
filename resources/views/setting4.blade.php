<!-- resources/views/setting4.blade.php -->

<!DOCTYPE html>
<html lang="ja">
<head>
<meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ルール設定</title>
    <link rel="stylesheet" href="{{ asset('css/setting4.css') }}">
    @vite('resources/css/setting4.css')
</head>
<body>
    <div>
        <label for="switch0" class="setting4-switch_label">
            <span class="setting4-description">縛り:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch0" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title0">OFF</span>
        </label><br>

        <label for="switch1" class="setting4-switch_label">
            <span class="setting4-description">数しばり:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch1" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title1">OFF</span>
        </label><br>

        <label for="switch2" class="setting4-switch_label">
            <span class="setting4-description">8切り:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch2" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title2">OFF</span>
        </label><br>

        <label for="switch3" class="setting4-switch_label">
            <span class="setting4-description">11バック:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch3" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title3">OFF</span>
        </label><br>

        <label for="switch4" class="setting4-switch_label">
            <span class="setting4-description">スぺ3返し:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch4" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title4">OFF</span>
        </label><br>

        <label for="switch5" class="setting4-switch_label">
            <span class="setting4-description">5スキップ:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch5" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title5">OFF</span>
        </label><br>

        <label for="switch6" class="setting4-switch_label">
            <span class="setting4-description">7渡し:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch6" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title6">OFF</span>
        </label><br>

        <label for="switch7" class="setting4-switch_label">
            <span class="setting4-description">10捨て:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch7" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title7">OFF</span>
        </label><br>

        <label for="switch8" class="setting4-switch_label">
            <span class="setting4-description">12ボンバー:</span>
            <div class="setting4-switch">
                <input type="checkbox" id="switch8" class="setting4-switch_input" />
                <div class="setting4-circle"></div>
                <div class="setting4-base"></div>
            </div>
            <span class="setting4-title" id="title8">OFF</span>
        </label>
    </div>

    <script src="{{ asset('js/setting4.js') }}"></script>
    @vite('resources/js/setting4.js')
</body>
</html>

