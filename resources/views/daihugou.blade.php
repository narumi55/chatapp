<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/daihugou4.css') }}">
    @vite('resources/css/daihugou4.css')
    <title>大富豪</title>
</head>
<body>
    <div class="container">
        <div>
            <canvas id="canvas" width="830" height="915"></canvas><br>
            <img id="siro1" src="{{ asset('images/daihugou/城1.png') }}" style="display:none" />
            <img id="siro2" src="{{ asset('images/daihugou/城2.png') }}" style="display:none" />
            <img id="p1" src="{{ asset('images/daihugou/魔法陣2.png') }}" style="display:none" />
            <img id="p2" src="{{ asset('images/daihugou/魔法陣1.png') }}" style="display:none" />

            <img id="c12" src="{{ asset('images/supaida/torannpu-illust14.png') }}" style="display:none" />
            <img id="c13" src="{{ asset('images/supaida/torannpu-illust15.png') }}" style="display:none" />
            <img id="c1" src="{{ asset('images/supaida/torannpu-illust16.png') }}" style="display:none" />
            <img id="c2" src="{{ asset('images/supaida/torannpu-illust17.png') }}" style="display:none" />
            <img id="c3" src="{{ asset('images/supaida/torannpu-illust18.png') }}" style="display:none" />
            <img id="c4" src="{{ asset('images/supaida/torannpu-illust19.png') }}" style="display:none" />
            <img id="c5" src="{{ asset('images/supaida/torannpu-illust20.png') }}" style="display:none" />
            <img id="c6" src="{{ asset('images/supaida/torannpu-illust21.png') }}" style="display:none" />
            <img id="c7" src="{{ asset('images/supaida/torannpu-illust22.png') }}" style="display:none" />
            <img id="c8" src="{{ asset('images/supaida/torannpu-illust23.png') }}" style="display:none" />
            <img id="c9" src="{{ asset('images/supaida/torannpu-illust24.png') }}" style="display:none" />
            <img id="c10" src="{{ asset('images/supaida/torannpu-illust25.png') }}" style="display:none" />
            <img id="c11" src="{{ asset('images/supaida/torannpu-illust26.png') }}" style="display:none" />
            <img id="d12" src="{{ asset('images/supaida/torannpu-illust27.png') }}" style="display:none" />
            <img id="d13" src="{{ asset('images/supaida/torannpu-illust28.png') }}" style="display:none" />
            <img id="d1" src="{{ asset('images/supaida/torannpu-illust29.png') }}" style="display:none" />
            <img id="d2" src="{{ asset('images/supaida/torannpu-illust30.png') }}" style="display:none" />
            <img id="d3" src="{{ asset('images/supaida/torannpu-illust31.png') }}" style="display:none" />
            <img id="d4" src="{{ asset('images/supaida/torannpu-illust32.png') }}" style="display:none" />
            <img id="d5" src="{{ asset('images/supaida/torannpu-illust33.png') }}" style="display:none" />
            <img id="d6" src="{{ asset('images/supaida/torannpu-illust34.png') }}" style="display:none" />
            <img id="d7" src="{{ asset('images/supaida/torannpu-illust35.png') }}" style="display:none" />
            <img id="d8" src="{{ asset('images/supaida/torannpu-illust36.png') }}" style="display:none" />
            <img id="d9" src="{{ asset('images/supaida/torannpu-illust37.png') }}" style="display:none" />
            <img id="d10" src="{{ asset('images/supaida/torannpu-illust38.png') }}" style="display:none" />
            <img id="d11" src="{{ asset('images/supaida/torannpu-illust39.png') }}" style="display:none" />
            <img id="h12" src="{{ asset('images/supaida/torannpu-illust40.png') }}" style="display:none" />
            <img id="h13" src="{{ asset('images/supaida/torannpu-illust41.png') }}" style="display:none" />
            <img id="h1" src="{{ asset('images/supaida/torannpu-illust42.png') }}" style="display:none" />
            <img id="h2" src="{{ asset('images/supaida/torannpu-illust43.png') }}" style="display:none" />
            <img id="h3" src="{{ asset('images/supaida/torannpu-illust44.png') }}" style="display:none" />
            <img id="h4" src="{{ asset('images/supaida/torannpu-illust45.png') }}" style="display:none" />
            <img id="h5" src="{{ asset('images/supaida/torannpu-illust46.png') }}" style="display:none" />
            <img id="h6" src="{{ asset('images/supaida/torannpu-illust47.png') }}" style="display:none" />
            <img id="h7" src="{{ asset('images/supaida/torannpu-illust48.png') }}" style="display:none" />
            <img id="h8" src="{{ asset('images/supaida/torannpu-illust49.png') }}" style="display:none" />
            <img id="h9" src="{{ asset('images/supaida/torannpu-illust50.png') }}" style="display:none" />
            <img id="h10" src="{{ asset('images/supaida/torannpu-illust51.png') }}" style="display:none" />
            <img id="h11" src="{{ asset('images/supaida/torannpu-illust52.png') }}" style="display:none" />
            <img id="s12" src="{{ asset('images/supaida/torannpu-illust1.png') }}" style="display:none" />
            <img id="s13" src="{{ asset('images/supaida/torannpu-illust2.png') }}" style="display:none" />
            <img id="s1" src="{{ asset('images/supaida/torannpu-illust3.png') }}" style="display:none" />
            <img id="s2" src="{{ asset('images/supaida/torannpu-illust4.png') }}" style="display:none" />
            <img id="s3" src="{{ asset('images/supaida/torannpu-illust5.png') }}" style="display:none" />
            <img id="s4" src="{{ asset('images/supaida/torannpu-illust6.png') }}" style="display:none" />
            <img id="s5" src="{{ asset('images/supaida/torannpu-illust7.png') }}" style="display:none" />
            <img id="s6" src="{{ asset('images/supaida/torannpu-illust8.png') }}" style="display:none" />
            <img id="s7" src="{{ asset('images/supaida/torannpu-illust9.png') }}" style="display:none" />
            <img id="s8" src="{{ asset('images/supaida/torannpu-illust10.png') }}" style="display:none" />
            <img id="s9" src="{{ asset('images/supaida/torannpu-illust11.png') }}" style="display:none" />
            <img id="s10" src="{{ asset('images/supaida/torannpu-illust12.png') }}" style="display:none" />
            <img id="s11" src="{{ asset('images/supaida/torannpu-illust13.png') }}" style="display:none" />
            <img id="j14" src="{{ asset('images/supaida/torannpu-illust53.png') }}" style="display:none" />
            <img id="z1" src="{{ asset('images/supaida/torannpu-illust54.png') }}" style="display:none" />

            <button onclick="pass()">パス</button>
            
        </div>
        <div id="customAlert" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background-color:white; border:1px solid black; padding:20px; z-index:1000;">
            <p id="alertMessage"></p>
        </div>
    </div>
    <script src="{{ asset('js/daihgou.js') }}"></script>
    @vite('resources/js/daihugou.js')
</body>