<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // Authファサードのインポート
use App\Http\Controllers\HomeController;
// routes/web.php

use App\Http\Controllers\SwitchController;

Route::post('/save-switch-state', [SwitchController::class, 'saveSwitchState']);
Route::get('/get-switch-state', [SwitchController::class, 'getSwitchState']);


// ホーム画面（ゲームホーム）のルート
Route::get('/', function () {
    return view('gamehome');
});

Route::get('/daihugou4', function () {
    return view('daihugou4');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/register', function () {
    return view('register');
});

// 認証機能のルートを登録
Auth::routes();

// ホームページへのルート
Route::get('/home', [HomeController::class, 'index'])->name('home');

// データ追加のためのPOSTルート
Route::post('/add', [HomeController::class, 'add'])->name('add');

// Ajaxでデータを取得するためのGETルート
Route::get('/result/ajax', [HomeController::class, 'getData'])->name('result.ajax');
