@extends('layouts.app')

@section('content')
<div class="chat-container row justify-content-center">
    <div class="chat-area">
        <div class="card">
            <div class="card-header">Comment</div>
            <div class="card-body chat-card">
                <div id="comment-data"></div>
            </div>
        </div>
    </div>
</div>

<form method="POST" action="{{ route('add') }}">
    @csrf
    <div class="comment-container row justify-content-center">
        <div class="input-group comment-area">
            <textarea class="form-control" id="comment" name="comment" placeholder="push message (shift + Enter)"
                aria-label="With textarea"
                onkeydown="if(event.shiftKey&&event.keyCode==13){document.getElementById('submit').click();return false};"></textarea>
            <button type="submit" id="submit" class="btn btn-outline-primary comment-btn">Submit</button>
        </div>
    </div>
</form>

@endsection

@section('js')
<script src="{{ asset('js/comment.js') }}"></script> <!-- 必要に応じてファイルを分けて管理 -->
<script>
    $(function() {
        $("form").on("submit", function(event) {
            event.preventDefault();  // フォームのデフォルト送信を防ぐ

            var comment = $("#comment").val();  // コメント内容を取得

            $.ajax({
                type: "POST",
                url: "{{ route('add') }}",  // ルートに対応するURL
                data: {
                    _token: $("meta[name='csrf-token']").attr("content"),  // CSRFトークンを送信
                    comment: comment
                },
                dataType: "json",
                success: function(response) {
                    if (response.success) {
                        // 新しいコメントを画面に追加
                        var newCommentHtml = `
                            <div class="media comment-visible">
                                <div class="media-body comment-body">
                                    <div class="row">
                                        <span class="comment-body-user">${response.comment.name}</span>
                                        <span class="comment-body-time">${response.comment.created_at}</span>
                                    </div>
                                    <span class="comment-body-content">${response.comment.comment}</span>
                                </div>
                            </div>
                        `;
                        $("#comment-data").prepend(newCommentHtml);  // 新しいコメントを先頭に追加
                        $("#comment").val("");  // コメント欄をクリア
                    }
                },
                error: function() {
                    alert("Error sending comment.");
                }
            });
        });
    });
</script>
@endsection

