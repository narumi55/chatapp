<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $comments = Comment::get();
        return view('home', ['comments' => $comments]);
    }

    public function add(Request $request)
{
    // 認証済みのユーザーを取得
    $user = Auth::user();
    
    // フォームから送信されたコメントを取得
    $comment = $request->input('comment');
    
    // コメントをデータベースに保存
    $newComment = Comment::create([
        'login_id' => $user->id,
        'name' => $user->name,
        'comment' => $comment
    ]);
    
    // 新しく追加されたコメントを含むJSONレスポンスを返す
    $newComment->created_at = $newComment->created_at->format('Y-m-d H:i:s');  // 日付フォーマット
    return response()->json(['success' => true, 'comment' => $newComment]);
}


    public function getData()
    {
        $comments = Comment::orderBy('created_at', 'desc')->get();
        $json = ["comments" => $comments];
        return response()->json($json);
    }
}

