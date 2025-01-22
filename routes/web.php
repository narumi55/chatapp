<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // Authファサードのインポート
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\SwitchController;
use App\Http\Controllers\RoomController;

Route::post('/game-control/user-turn', [DataController::class, 'userTurn']);
Route::post('/game-control/initialize-game', [DataController::class, 'initializeGame']);
Route::post('/user-turn', [DataController::class, 'userTurn'])->name('game.userTurn');


Route::view('/auth/login', 'auth.login')->name('login');
Route::view('/auth/register', 'auth.register')->name('register');
// 認証機能のルートを登録
Auth::routes();

// ホーム画面（ゲームホーム）のルート
Route::get('/', function () {
    return view('gamehome');
});

// その他のビューへのルート
Route::view('/daihugou4', 'daihugou4');
Route::view('/daihugou', 'daihugou')->name('daihugou')->middleware('auth');
Route::view('/host', 'host');
Route::view('/guest', 'guest');
Route::get('/guest2', [RoomController::class, 'guest2'])->name('rooms.guest2');

// データ追加のためのPOSTルート
Route::post('/add', [HomeController::class, 'add'])->name('add');

// Ajaxでデータを取得するためのGETルート
Route::get('/result/ajax', [HomeController::class, 'getData'])->name('result.ajax');

Route::group(['middleware' => ['auth']], function() {
    Route::post('/save-switch-state', [SwitchController::class, 'save'])->name('save.switch.state');
    Route::get('/get-switch-state', [SwitchController::class, 'get'])->name('get.switch.state');
});

Route::post('/rooms/create', [RoomController::class, 'createRoom'])->name('rooms.create');
Route::post('/rooms/join', [RoomController::class, 'joinRoom'])->name('rooms.join');
Route::get('/join-room', [RoomController::class, 'showJoinForm'])->name('rooms.join.form')->middleware('auth');
// ここは1回だけ
Route::get('/rooms/check-guest', [RoomController::class, 'checkGuest'])->name('rooms.checkGuest');
Route::get('/guest2/{room}', [RoomController::class, 'guest2'])->name('rooms.guest2')->middleware('auth');

Route::post('/join-room', [RoomController::class, 'joinRoom'])->name('rooms.join');
Route::get('/api/room/{pin}', [RoomController::class, 'getRoomData'])->name('api.room.data');

Route::post('/rooms/start-game', [RoomController::class, 'startGame'])
    ->name('rooms.startGame');

Route::get('/api/room/{pin}/started', [RoomController::class, 'checkStarted'])
    ->name('rooms.checkStarted');

Route::get('/rooms/daihugou', [RoomController::class, 'daihugou'])
    ->name('rooms.daihugou');