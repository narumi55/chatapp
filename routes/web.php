<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // Authファサードのインポート
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\SwitchController;

Route::post('/game-control/user-turn', [DataController::class, 'userTurn']);
Route::post('/game-control/initialize-game', [DataController::class, 'initializeGame']);

// 認証機能のルートを登録
Auth::routes();

// ホームページへのルート
Route::get('/home', [HomeController::class, 'index'])->name('home');

// ホーム画面（ゲームホーム）のルート
Route::get('/', function () {
    return view('gamehome');
});

// その他のビューへのルート
Route::view('/daihugou4', 'daihugou4');
Route::view('/daihugou', 'daihugou');

// データ追加のためのPOSTルート
Route::post('/add', [HomeController::class, 'add'])->name('add');

// Ajaxでデータを取得するためのGETルート
Route::get('/result/ajax', [HomeController::class, 'getData'])->name('result.ajax');

// SwitchState 関連のルート
Route::post('/save-switch-state', [SwitchController::class, 'saveSwitchState'])->name('save.switch.state');
Route::get('/get-switch-state', [SwitchController::class, 'getSwitchState'])->name('get.switch.state');

// ゲーム初期化と制御のルート
Route::match(['get', 'post'], '/initialize-game', [DataController::class, 'initializeGame'])->name('initialize.game');
Route::post('/game-control/user-turn', [DataController::class, 'userTurn'])->name('game.control.user.turn');
Route::post('/game-control', [DataController::class, 'gameControl'])->name('game.control');

