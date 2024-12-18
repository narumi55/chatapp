<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="{{ asset('css/daihugou4.css') }}">
    @vite('resources/css/daihugou4.css')
    <title>大富豪</title>
</head>
<body onload="init()">
    <div class="container">
        <div>
            <canvas id="canvas" width="830" height="915"></canvas><br>
            <img id="siro1" src="{{ asset('images/daihugou/城1.png') }}" style="display:none" />
            <img id="siro2" src="{{ asset('images/daihugou/城2.png') }}" style="display:none" />
            <img id="p1" src="{{ asset('images/daihugou/魔法陣2.png') }}" style="display:none" />
            <img id="p2" src="{{ asset('images/daihugou/魔法陣1.png') }}" style="display:none" />

            <img id="012" src="{{ asset('images/supaida/torannpu-illust14.png') }}" style="display:none" />
            <img id="013" src="{{ asset('images/supaida/torannpu-illust15.png') }}" style="display:none" />
            <img id="01" src="{{ asset('images/supaida/torannpu-illust16.png') }}" style="display:none" />
            <img id="02" src="{{ asset('images/supaida/torannpu-illust17.png') }}" style="display:none" />
            <img id="03" src="{{ asset('images/supaida/torannpu-illust18.png') }}" style="display:none" />
            <img id="04" src="{{ asset('images/supaida/torannpu-illust19.png') }}" style="display:none" />
            <img id="05" src="{{ asset('images/supaida/torannpu-illust20.png') }}" style="display:none" />
            <img id="06" src="{{ asset('images/supaida/torannpu-illust21.png') }}" style="display:none" />
            <img id="07" src="{{ asset('images/supaida/torannpu-illust22.png') }}" style="display:none" />
            <img id="08" src="{{ asset('images/supaida/torannpu-illust23.png') }}" style="display:none" />
            <img id="09" src="{{ asset('images/supaida/torannpu-illust24.png') }}" style="display:none" />
            <img id="010" src="{{ asset('images/supaida/torannpu-illust25.png') }}" style="display:none" />
            <img id="011" src="{{ asset('images/supaida/torannpu-illust26.png') }}" style="display:none" />
            <img id="112" src="{{ asset('images/supaida/torannpu-illust27.png') }}" style="display:none" />
            <img id="113" src="{{ asset('images/supaida/torannpu-illust28.png') }}" style="display:none" />
            <img id="11" src="{{ asset('images/supaida/torannpu-illust29.png') }}" style="display:none" />
            <img id="12" src="{{ asset('images/supaida/torannpu-illust30.png') }}" style="display:none" />
            <img id="13" src="{{ asset('images/supaida/torannpu-illust31.png') }}" style="display:none" />
            <img id="14" src="{{ asset('images/supaida/torannpu-illust32.png') }}" style="display:none" />
            <img id="15" src="{{ asset('images/supaida/torannpu-illust33.png') }}" style="display:none" />
            <img id="16" src="{{ asset('images/supaida/torannpu-illust34.png') }}" style="display:none" />
            <img id="17" src="{{ asset('images/supaida/torannpu-illust35.png') }}" style="display:none" />
            <img id="18" src="{{ asset('images/supaida/torannpu-illust36.png') }}" style="display:none" />
            <img id="19" src="{{ asset('images/supaida/torannpu-illust37.png') }}" style="display:none" />
            <img id="110" src="{{ asset('images/supaida/torannpu-illust38.png') }}" style="display:none" />
            <img id="111" src="{{ asset('images/supaida/torannpu-illust39.png') }}" style="display:none" />
            <img id="212" src="{{ asset('images/supaida/torannpu-illust40.png') }}" style="display:none" />
            <img id="213" src="{{ asset('images/supaida/torannpu-illust41.png') }}" style="display:none" />
            <img id="21" src="{{ asset('images/supaida/torannpu-illust42.png') }}" style="display:none" />
            <img id="22" src="{{ asset('images/supaida/torannpu-illust43.png') }}" style="display:none" />
            <img id="23" src="{{ asset('images/supaida/torannpu-illust44.png') }}" style="display:none" />
            <img id="24" src="{{ asset('images/supaida/torannpu-illust45.png') }}" style="display:none" />
            <img id="25" src="{{ asset('images/supaida/torannpu-illust46.png') }}" style="display:none" />
            <img id="26" src="{{ asset('images/supaida/torannpu-illust47.png') }}" style="display:none" />
            <img id="27" src="{{ asset('images/supaida/torannpu-illust48.png') }}" style="display:none" />
            <img id="28" src="{{ asset('images/supaida/torannpu-illust49.png') }}" style="display:none" />
            <img id="29" src="{{ asset('images/supaida/torannpu-illust50.png') }}" style="display:none" />
            <img id="210" src="{{ asset('images/supaida/torannpu-illust51.png') }}" style="display:none" />
            <img id="211" src="{{ asset('images/supaida/torannpu-illust52.png') }}" style="display:none" />
            <img id="312" src="{{ asset('images/supaida/torannpu-illust1.png') }}" style="display:none" />
            <img id="313" src="{{ asset('images/supaida/torannpu-illust2.png') }}" style="display:none" />
            <img id="31" src="{{ asset('images/supaida/torannpu-illust3.png') }}" style="display:none" />
            <img id="32" src="{{ asset('images/supaida/torannpu-illust4.png') }}" style="display:none" />
            <img id="33" src="{{ asset('images/supaida/torannpu-illust5.png') }}" style="display:none" />
            <img id="34" src="{{ asset('images/supaida/torannpu-illust6.png') }}" style="display:none" />
            <img id="35" src="{{ asset('images/supaida/torannpu-illust7.png') }}" style="display:none" />
            <img id="36" src="{{ asset('images/supaida/torannpu-illust8.png') }}" style="display:none" />
            <img id="37" src="{{ asset('images/supaida/torannpu-illust9.png') }}" style="display:none" />
            <img id="38" src="{{ asset('images/supaida/torannpu-illust10.png') }}" style="display:none" />
            <img id="39" src="{{ asset('images/supaida/torannpu-illust11.png') }}" style="display:none" />
            <img id="310" src="{{ asset('images/supaida/torannpu-illust12.png') }}" style="display:none" />
            <img id="311" src="{{ asset('images/supaida/torannpu-illust13.png') }}" style="display:none" />
            <img id="414" src="{{ asset('images/supaida/torannpu-illust53.png') }}" style="display:none" />
            <img id="z1" src="{{ asset('images/supaida/torannpu-illust54.png') }}" style="display:none" />

            <button onclick="pass()">パス</button>
            
        </div>
        <div id="customAlert" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background-color:white; border:1px solid black; padding:20px; z-index:1000;">
            <p id="alertMessage"></p>
        </div>
    </div>
    <script src="{{ asset('js/daihgou4.js') }}"></script>
    @vite('resources/js/daihugou4.js')
</body>